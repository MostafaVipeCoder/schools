import{u,a as c}from"./useMutation-IYQKq16w.js";import{s as t,u as d}from"./index-5T5WBcDA.js";import{t as o}from"./ui-vendor-BySOLbq-.js";const r={async getByStudentId(s){const{data:e,error:n}=await t.from("suspensions").select("*").eq("student_id",s).order("created_at",{ascending:!1});if(n)throw n;return e},async getAll(){const{data:s,error:e}=await t.from("suspensions").select(`
                *,
                students (
                    name,
                    class_id,
                    classes (
                        name
                    )
                )
            `).order("created_at",{ascending:!1});if(e)throw e;return s},async create(s){const{data:e,error:n}=await t.from("suspensions").insert([s]).select().single();if(n)throw n;return e},async delete(s){const{error:e}=await t.from("suspensions").delete().eq("id",s);if(e)throw e}},m=s=>{const e=d(),n=u({queryKey:["suspensions",s],queryFn:()=>s?r.getByStudentId(s):r.getAll()}),a=c({mutationFn:r.create,onSuccess:()=>{o.success("تم تسجيل المخالفة السلوكية بنجاح"),e.invalidateQueries({queryKey:["suspensions"]})},onError:i=>{console.error(i),o.error("فشل تسجيل المخالفة")}});return{suspensions:n.data||[],isLoading:n.isLoading,addSuspension:a.mutateAsync}};export{m as u};
