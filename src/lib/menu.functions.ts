import { createServerFn } from "@tanstack/react-start";

export type Branch = { id:string; slug:string; name:string; short_name:string|null; address:string|null; area:string|null; city:string|null; phone:string|null; whatsapp:string|null; maps_url:string|null; opening_time:string|null; closing_time:string|null; delivery_available:boolean; pickup_available:boolean; delivery_fee:number; is_open:boolean; };
export type Variant = { id:string; name:string; price:number; sort_order:number };
export type MenuProduct = { id:string; slug:string; name:string; description:string|null; includes:string[]|null; base_price:number|null; price_note:string|null; image_url:string|null; is_popular:boolean; is_chef_special:boolean; is_bestseller:boolean; is_new:boolean; out_of_stock:boolean; category_id:string; sort_order:number; product_variants:Variant[]; };
export type MenuCategory = { id:string; slug:string; name:string; description:string|null; image_url:string|null; sort_order:number; products:MenuProduct[]; };

async function menuData(){ return import("@/lib/menu.data"); }

// The finalized printed menu is the customer-facing source of truth.
// Bundling it prevents menu/home rendering from failing when a preview lacks Supabase env/access.
export const getBranches=createServerFn({method:"GET"}).handler(async()=>{const {STATIC_BRANCHES}=await menuData();return STATIC_BRANCHES;});
export const getMenu=createServerFn({method:"GET"}).handler(async()=>{const {STATIC_MENU}=await menuData();return STATIC_MENU;});
export const getFeatured=createServerFn({method:"GET"}).handler(async()=>{const {STATIC_FEATURED}=await menuData();return STATIC_FEATURED;});
