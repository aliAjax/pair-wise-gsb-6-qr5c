import{useEffect,useState}from'react';
import{DEFAULT_STYLE,StyleParams,TypeStyle}from'./styleLibrary';

export interface Pair{
  id:number;
  title:string;
  heading:string;
  body:string;
  category:string;
  favorite:boolean;
  /** 样式引用：永远指向一个存在的样式，不允许为空 */
  styleId:string;
  /** 配对内的单独调整，只存在配对上，不回写样式本身 */
  overrides:Partial<StyleParams>;
}

const ARCHIVE_KEY='type-pairs';

const seed:Pair[]=[
  {id:1,title:'Editorial calm',heading:'A slower way to see',body:'Good typography creates space for ideas to breathe. Pair a confident display face with a quiet, generous text face.',category:'Editorial',favorite:true,styleId:'editorial-serif',overrides:{}},
  {id:2,title:'Studio notes',heading:'Make room for the unexpected',body:'A thoughtful pairing can add rhythm to even the simplest interface. Try contrast in shape, not just size.',category:'Portfolio',favorite:false,styleId:'modern-grotesk',overrides:{}},
  {id:3,title:'Field guide',heading:'Small details, lasting impressions',body:'Typography is the voice of a page. Find a combination that feels clear, warm and distinctly yours.',category:'Brand',favorite:false,styleId:'default',overrides:{}},
];

function load():Pair[]{
  try{
    const raw=JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'null');
    if(!Array.isArray(raw)||!raw.length)return seed;
    // 旧存档迁移：补上样式引用与覆盖层，默认绑定到默认样式
    return(raw as Pair[]).map(p=>({
      ...p,
      styleId:typeof p.styleId==='string'?p.styleId:DEFAULT_STYLE.id,
      overrides:p.overrides??{},
    }));
  }catch{
    return seed;
  }
}

/** 配对引用：独立维护配对与样式的绑定关系，并与本地存档同步 */
export function usePairings(styles:TypeStyle[]){
  const[pairs,setPairs]=useState<Pair[]>(load);
  useEffect(()=>{localStorage.setItem(ARCHIVE_KEY,JSON.stringify(pairs))},[pairs]);

  // 兜底：样式存档变化后，失去引用的配对一律回落到默认样式，绝不留空
  useEffect(()=>{
    setPairs(ps=>{
      const ids=new Set(styles.map(s=>s.id));
      if(ps.every(p=>ids.has(p.styleId)))return ps;
      return ps.map(p=>ids.has(p.styleId)?p:{...p,styleId:DEFAULT_STYLE.id});
    });
  },[styles]);

  const addPair=(title:string):number=>{
    const id=Date.now();
    setPairs(ps=>[...ps,{id,title,heading:'Your new headline',body:'Start with a sentence that lets your type pairing show its character.',category:'Untitled',favorite:false,styleId:DEFAULT_STYLE.id,overrides:{}}]);
    return id;
  };
  const removePair=(id:number)=>setPairs(ps=>ps.filter(p=>p.id!==id));
  const toggleFavorite=(id:number)=>setPairs(ps=>ps.map(p=>p.id===id?{...p,favorite:!p.favorite}:p));

  /** 改绑样式；resetOverrides 用于“恢复默认”时清掉单独调整 */
  const bindStyle=(id:number,styleId:string,resetOverrides=false)=>
    setPairs(ps=>ps.map(p=>p.id===id?{...p,styleId,...(resetOverrides?{overrides:{}}:{})}:p));

  /** 编辑器只写覆盖层：与样式一致的值不记为覆盖，样式本身永不被配对改动 */
  const setOverride=(id:number,patch:Partial<StyleParams>)=>
    setPairs(ps=>ps.map(p=>{
      if(p.id!==id)return p;
      const style=styles.find(s=>s.id===p.styleId)??DEFAULT_STYLE;
      const overrides:Partial<StyleParams>={...p.overrides};
      (Object.entries(patch)as[keyof StyleParams,string|number][]).forEach(([k,v])=>{
        if(style.params[k]===v)delete overrides[k];
        else overrides[k]=v as never;
      });
      return{...p,overrides};
    }));

  const clearOverrides=(id:number)=>setPairs(ps=>ps.map(p=>p.id===id?{...p,overrides:{}}:p));

  /** 删除样式前调用：把使用者整体改绑；目标是默认样式时同时清空覆盖，即“恢复默认” */
  const rebindStyle=(fromId:string,toId:string)=>
    setPairs(ps=>ps.map(p=>p.styleId===fromId?{...p,styleId:toId,...(toId===DEFAULT_STYLE.id?{overrides:{}}:{})}:p));

  const usageOf=(styleId:string)=>pairs.filter(p=>p.styleId===styleId).length;

  return{pairs,addPair,removePair,toggleFavorite,bindStyle,setOverride,clearOverrides,rebindStyle,usageOf};
}
