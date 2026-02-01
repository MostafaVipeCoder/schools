import{u as m,a as i}from"./useMutation-IYQKq16w.js";import{u as S,s as n}from"./index-5T5WBcDA.js";import{t as a}from"./ui-vendor-BySOLbq-.js";const f=()=>{const e=S(),u=m({queryKey:["students"],queryFn:async()=>{const{data:s,error:t}=await n.from("students").select(`
          *,
          classes (
            id,
            name,
            grade_level
          )
        `).order("created_at",{ascending:!1});if(t)throw t;return s},staleTime:1e3*60*5}),o=i({mutationFn:async s=>{const{data:t,error:r}=await n.from("students").insert([s]).select(`
          *,
          classes (
            id,
            name,
            grade_level
          )
        `).single();if(r)throw r;return t},onMutate:async s=>{await e.cancelQueries({queryKey:["students"]});const t=e.getQueryData(["students"]);return e.setQueryData(["students"],r=>{const l=Math.random().toString(),d={...s,id:l,created_at:new Date().toISOString(),classes:{id:s.class_id,name:"...",grade_level:"..."}};return r?[d,...r]:[d]}),{previousStudents:t}},onError:(s,t,r)=>{a.error("فشل إضافة الطالب"),r?.previousStudents&&e.setQueryData(["students"],r.previousStudents)},onSuccess:()=>{a.success("تم أضافة الطالب بنجاح")},onSettled:()=>{e.invalidateQueries({queryKey:["students"]}),e.invalidateQueries({queryKey:["classes"]}),e.invalidateQueries({queryKey:["grades"]})}}),c=i({mutationFn:async({id:s,data:t})=>{const{error:r}=await n.from("students").update(t).eq("id",s);if(r)throw r},onSuccess:()=>{a.success("تم تعديل بيانات الطالب بنجاح"),e.invalidateQueries({queryKey:["students"]}),e.invalidateQueries({queryKey:["classes"]}),e.invalidateQueries({queryKey:["grades"]})},onError:()=>{a.error("فشل تعديل بيانات الطالب")}}),y=i({mutationFn:async s=>{const{error:t}=await n.from("students").delete().eq("id",s);if(t)throw t},onSuccess:()=>{a.success("تم حذف الطالب بنجاح"),e.invalidateQueries({queryKey:["students"]}),e.invalidateQueries({queryKey:["classes"]}),e.invalidateQueries({queryKey:["grades"]})},onError:()=>{a.error("فشل حذف الطالب")}});return{students:u.data||[],isLoading:u.isLoading,isError:u.isError,addStudent:o.mutateAsync,updateStudent:c.mutateAsync,deleteStudent:y.mutateAsync}};export{f as u};
