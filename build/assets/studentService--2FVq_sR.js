import{s as r}from"./index-5T5WBcDA.js";import"./radix-ui-CdWaIGdm.js";import"./react-vendor-OTFbGeLr.js";import"./icons-Dv6B0Gq0.js";import"./ui-vendor-BySOLbq-.js";const f={async getAll(){const{data:e,error:t}=await r.from("students").select(`
        *,
        classes (
          id,
          name,
          grade_level,
          stage
        )
      `).order("created_at",{ascending:!1});if(t)throw t;return e},async getById(e){const t=r.from("students").select(`
                *,
                classes (
                    id,
                    name,
                    grade_level,
                    stage
                )
            `),a=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e),{data:s,error:n}=await(a?t.eq("id",e):t.eq("slug",e)).single();if(n)throw n;return s},async create(e){const{data:{user:t}}=await r.auth.getUser();if(!t)throw new Error("User not authenticated");const{data:a,error:s}=await r.from("students").insert([{...e,user_id:t.id}]).select().single();if(s)throw s;const n=e.name.toLowerCase().replace(/[^a-z0-9\u0621-\u064A]+/g,"-")+"-"+a.id.substring(0,4),{data:i,error:o}=await r.from("students").update({slug:n}).eq("id",a.id).select().single();return o&&console.error("Error updating slug:",o),i||a},async update(e,t){const{data:a,error:s}=await r.from("students").update({...t,updated_at:new Date().toISOString()}).eq("id",e).select().single();if(s)throw s;return a},async delete(e){const{error:t}=await r.from("students").delete().eq("id",e);if(t)throw t},async search(e){const{data:t,error:a}=await r.from("students").select(`
        *,
        classes (
          id,
          name,
          grade_level,
          stage
        )
      `).or(`name.ilike.%${e}%,email.ilike.%${e}%,phone.ilike.%${e}%,guardian_name.ilike.%${e}%`).order("created_at",{ascending:!1});if(a)throw a;return t}};export{f as studentService};
