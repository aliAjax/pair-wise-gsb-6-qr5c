import{useEffect,useState}from'react';

/** 一套可复用的类型参数：标题/正文字体、字号、字重、行高、字距 */
export interface StyleParams{
  headingFont:string;
  bodyFont:string;
  size:number;
  weight:number;
  leading:number;
  tracking:number;
}

export interface TypeStyle{
  id:string;
  name:string;
  params:StyleParams;
  /** 内置样式不可编辑、不可删除，作为“恢复默认”的兜底 */
  builtin?:boolean;
}

export const FONT_OPTIONS=['Fraunces','DM Sans','Space Grotesk','Newsreader','IBM Plex Sans','Playfair Display'];

export const DEFAULT_STYLE:TypeStyle={
  id:'default',
  name:'默认样式',
  builtin:true,
  params:{headingFont:'Fraunces',bodyFont:'DM Sans',size:46,weight:600,leading:1.25,tracking:0},
};

const ARCHIVE_KEY='type-styles';

const seedStyles:TypeStyle[]=[
  DEFAULT_STYLE,
  {id:'editorial-serif',name:'Editorial serif',params:{headingFont:'Playfair Display',bodyFont:'Newsreader',size:52,weight:500,leading:1.4,tracking:-0.5}},
  {id:'modern-grotesk',name:'Modern grotesk',params:{headingFont:'Space Grotesk',bodyFont:'IBM Plex Sans',size:40,weight:600,leading:1.55,tracking:0.5}},
];

function load():TypeStyle[]{
  try{
    const raw=JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'null');
    if(!Array.isArray(raw)||!raw.length)return seedStyles;
    const valid=(raw as TypeStyle[]).filter(s=>s&&typeof s.id==='string'&&typeof s.name==='string'&&s.params);
    // 默认样式以代码内定义为准，不允许被存档覆盖或移除
    return[DEFAULT_STYLE,...valid.filter(s=>s.id!==DEFAULT_STYLE.id)];
  }catch{
    return seedStyles;
  }
}

/** 配对实际生效的参数 = 样式参数 + 配对内的单独调整（覆盖层） */
export function resolveParams(style:TypeStyle|undefined,overrides:Partial<StyleParams>):StyleParams{
  return{...DEFAULT_STYLE.params,...style?.params,...overrides};
}

/** 样式库：独立维护命名样式，并与本地存档同步 */
export function useStyleLibrary(){
  const[styles,setStyles]=useState<TypeStyle[]>(load);
  useEffect(()=>{localStorage.setItem(ARCHIVE_KEY,JSON.stringify(styles))},[styles]);

  const createStyle=(name:string,params:StyleParams):TypeStyle=>{
    const style:TypeStyle={id:`style-${Date.now()}`,name,params:{...params}};
    setStyles(ss=>[...ss,style]);
    return style;
  };

  /** 改样式即同步：所有绑定它的配对渲染时都读取这里的同一份参数 */
  const updateStyle=(id:string,params:Partial<StyleParams>,name?:string)=>{
    setStyles(ss=>ss.map(s=>s.id===id&&!s.builtin?{...s,name:name??s.name,params:{...s.params,...params}}:s));
  };

  const removeStyle=(id:string)=>{
    setStyles(ss=>ss.filter(s=>s.id!==id||s.builtin));
  };

  return{styles,createStyle,updateStyle,removeStyle};
}
