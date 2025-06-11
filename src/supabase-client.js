
// 사용자 식별자 관리
export const CART_TABLE = 'cart_items';
export const getUserId = () => {
    // 실제 로그인 시스템이 있다면 여기서 사용자 ID를 반환하도록 수정해야 함
    return 'anonymous_user';
};
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);