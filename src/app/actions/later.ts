'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LaterItem, ActionTaken, Checkpoint } from '@/types/focus'

export async function createLaterItem(content: string): Promise<LaterItem | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('later_items')
    .insert({
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating later item:', error)
    return null
  }

  revalidatePath('/dashboard')
  return data
}

export async function getLaterItems(date?: string): Promise<LaterItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('later_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .is('processed_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching later items:', error)
    return []
  }

  return data || []
}

export async function processLaterItem(
  itemId: string,
  action: ActionTaken
): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('later_items')
    .update({
      processed_at: new Date().toISOString(),
      action_taken: action,
    })
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error processing later item:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function clearLaterItems(date?: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = date || new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('later_items')
    .update({
      processed_at: new Date().toISOString(),
      action_taken: 'archived',
    })
    .eq('user_id', user.id)
    .eq('date', today)
    .is('processed_at', null)

  if (error) {
    console.error('Error clearing later items:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function convertToCheckpoint(
  itemId: string,
  focusId: string
): Promise<{ success: boolean; checkpoint?: Checkpoint }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First, get the later item content
  const { data: item, error: itemError } = await supabase
    .from('later_items')
    .select('content')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single()

  if (itemError || !item) {
    console.error('Error fetching later item:', itemError)
    return { success: false }
  }

  // Get current checkpoints count for ordering
  const { data: checkpoints } = await supabase
    .from('checkpoints')
    .select('display_order')
    .eq('focus_id', focusId)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = checkpoints && checkpoints.length > 0
    ? checkpoints[0].display_order + 1
    : 0

  // Create the checkpoint
  const { data: newCheckpoint, error: checkpointError } = await supabase
    .from('checkpoints')
    .insert({
      focus_id: focusId,
      title: item.content,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (checkpointError || !newCheckpoint) {
    console.error('Error creating checkpoint:', checkpointError)
    return { success: false }
  }

  // Mark the later item as converted
  await processLaterItem(itemId, 'converted')

  revalidatePath('/dashboard')
  return { success: true, checkpoint: newCheckpoint }
}

export async function deleteLaterItem(itemId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('later_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting later item:', error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}