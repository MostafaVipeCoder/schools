import{u,a as l}from"./useMutation-IYQKq16w.js";import{s as r,u as f}from"./index-5T5WBcDA.js";const d={async getByStudentId(t){const{data:e,error:n}=await r.from("attendance").select("*").eq("student_id",t).order("date",{ascending:!1});if(n)throw n;return e},async getAll(){const{data:t,error:e}=await r.from("attendance").select(`
                *,
                students (
                    name,
                    class_id,
                    classes (
                        name
                    )
                )
            `).order("date",{ascending:!1});if(e)throw e;return t},async markAttendance(t){const{data:{user:e}}=await r.auth.getUser();if(!e)throw new Error("User not authenticated");const{data:n,error:a}=await r.from("attendance").upsert([{...t,user_id:e.id}],{onConflict:"student_id, date"}).select().single();if(a)throw a;return n},async update(t,e){const{data:n,error:a}=await r.from("attendance").update(e).eq("id",t).select().single();if(a)throw a;return n},async delete(t){const{error:e}=await r.from("attendance").delete().eq("id",t);if(e)throw e},async getStats(t,e,n){const{data:a,error:c}=await r.from("attendance").select("*").eq("student_id",t).gte("date",e).lte("date",n);if(c)throw c;const s=a?.length||0,o=a?.filter(i=>i.present).length||0;return{total:s,present:o,absent:s-o,percentage:s>0?o/s*100:0}}},g=()=>{const t=f(),e=u({queryKey:["attendance"],queryFn:()=>d.getAll(),staleTime:1e3*60*2}),n=l({mutationFn:a=>d.markAttendance(a),onSuccess:()=>{t.invalidateQueries({queryKey:["attendance"]})},onError:a=>{console.error("Error marking attendance:",a)}});return{attendance:e.data||[],isLoading:e.isLoading,isError:e.isError,markAttendance:n.mutateAsync,refreshAttendance:e.refetch}};export{d as a,g as u};
