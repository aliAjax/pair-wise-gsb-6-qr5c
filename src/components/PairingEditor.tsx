import{SlidersHorizontal}from'lucide-react';
import{FONT_OPTIONS,StyleParams,TypeStyle}from'../styleLibrary';

interface Props{
  /** 生效参数（样式 + 覆盖层），只读展示 */
  value:StyleParams;
  styles:TypeStyle[];
  styleId:string;
  overrideCount:number;
  onBind:(styleId:string)=>void;
  onChange:(patch:Partial<StyleParams>)=>void;
  onClearOverrides:()=>void;
}

/** 配对编辑器：调整只写入当前配对的覆盖层，不会改动样式本身 */
export default function PairingEditor({value,styles,styleId,overrideCount,onBind,onChange,onClearOverrides}:Props){
  return<div className="controls">
    <div className="control-head">
      <div><span>TYPE CONTROLS</span><h3>Fine tune your pairing</h3></div>
      <SlidersHorizontal size={17}/>
    </div>
    <div className="bind-row">
      <span>样式</span>
      <select value={styleId} onChange={e=>onBind(e.target.value)}>
        {styles.map(s=><option key={s.id} value={s.id}>{s.name}{s.builtin?'（默认）':''}</option>)}
      </select>
      {overrideCount>0&&<span className="override-pill">已单独调整 {overrideCount} 项<button onClick={onClearOverrides}>重置</button></span>}
    </div>
    <div className="font-row">
      <label>Heading font
        <select value={value.headingFont} onChange={e=>onChange({headingFont:e.target.value})}>
          {FONT_OPTIONS.map(f=><option key={f}>{f}</option>)}
        </select>
      </label>
      <label>Body font
        <select value={value.bodyFont} onChange={e=>onChange({bodyFont:e.target.value})}>
          {FONT_OPTIONS.map(f=><option key={f}>{f}</option>)}
        </select>
      </label>
    </div>
    <div className="range-row">
      <label>Size <b>{value.size}px</b>
        <input type="range" min="28" max="76" value={value.size} onChange={e=>onChange({size:Number(e.target.value)})}/>
      </label>
      <label>Weight <b>{value.weight}</b>
        <input type="range" min="300" max="800" step="100" value={value.weight} onChange={e=>onChange({weight:Number(e.target.value)})}/>
      </label>
    </div>
    <div className="range-row">
      <label>Line height <b>{value.leading.toFixed(2)}</b>
        <input type="range" min="1" max="1.8" step=".05" value={value.leading} onChange={e=>onChange({leading:Number(e.target.value)})}/>
      </label>
      <label>Letter spacing <b>{value.tracking}px</b>
        <input type="range" min="-1" max="3" step=".5" value={value.tracking} onChange={e=>onChange({tracking:Number(e.target.value)})}/>
      </label>
    </div>
  </div>;
}
