import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kfsnhareeqqsrlnwylox.supabase.co"
const supabasePublishableKey = "sb_publishable_qbDt9z64Dcv4ihJsPzk3TQ_vo2hpYSe"

export const supabase = createClient(supabaseUrl, supabasePublishableKey)