import{useState}from'react';
import{Check,Pencil,Plus,Trash2}from'lucide-react';
import{DEFAULT_STYLE,FONT_OPTIONS,StyleParams,TypeStyle}from'../styleLibrary';

interface Props{
  styles:TypeStyle[];
  /** 当前编辑器生效参数，用于“存为样式” */
  currentParams:StyleParams;
  /** 当前配对绑定的样式 id */
  boundStyleId:string;
  usageOf:(styleId:string)=>number;
  onApply:(styleId:string)=>void;
  onCreate:(name:string,params:StyleParams)=>void;
  onUpdate:(id:string,params:Partial<StyleParams>,name?:string)=>void;
  /** rebindTo 存在时，App 先把使用者改绑到该样式再删除 */
  onRemove:(id:string,rebindTo?:string)=>void;
}

/** 样式库面板：命名样式的保存、应用、编辑与移除 */
export default function StyleLibraryPanel({styles,currentParams,boundStyleId,usageOf,onApply,onCreate,onUpdate,onRemove}:Props){
  const[saving,setSaving]=useState(false);
  const[newName,setNewName]=useState('');
  const[editingId,setEditingId]=useState<string|null>(null);
  const[deletingId,setDeletingId]=useState<string|null>(null);
  const[rebindTo,setRebindTo]=useState(DEFAULT_STYLE.id);

  const editing=styles.find(s=>s.id===editingId);
  const deleting=styles.find(s=>s.id===deletingId);
  const deletingUsage=deleting?usageOf(deleting.id):0;

  const save=()=>{
    if(!newName.trim())return;
    onCreate(newName.trim(),currentParams);
    setNewName('');setSaving(false);
  };
  const confirmRemove=()=>{
    if(!deleting)return;
    onRemove(deleting.id,deletingUsage>0?rebindTo:undefined);
    setDeletingId(null);
    if(editingId===deleting.id)setEditingId(null);
  };

  return<section className="styles-panel">
    <div className="control-head">
      <div><span>STYLE LIBRARY</span><h3>命名样式</h3></div>
      <button className="outline" onClick={()=>setSaving(true)}><Plus size={14}/>存为样式</button>
    </div>
    <div className="style-list">
      {styles.map(s=>{
        const usage=usageOf(s.id);
        const bound=s.id===boundStyleId;
        return<div key={s.id} className={bound?'style-item bound':'style-item'}>
          <button className="style-apply" onClick={()=>onApply(s.id)} title="应用到当前配对">
            <strong style={{fontFamily:s.params.headingFont}}>Aa</strong>
            <span>
              <b>{s.name}</b>
              <small>{s.params.headingFont} + {s.params.bodyFont} · {s.params.size}px / {s.params.weight} · {usage} 个配对在用</small>
            </span>
          </button>
          {bound&&<span className="tag">当前</span>}
          {s.builtin?<span className="tag">默认</span>:<>
            <button className="icon-btn" title="编辑样式" onClick={()=>setEditingId(editingId===s.id?null:s.id)}><Pencil size={14}/></button>
            <button className="icon-btn" title="移除样式" onClick={()=>{setRebindTo(DEFAULT_STYLE.id);setDeletingId(s.id)}}><Trash2 size={14}/></button>
          </>}
        </div>;
      })}
    </div>

    {editing&&<div className="style-edit">
      <label>样式名称
        <input className="name" value={editing.name} onChange={e=>onUpdate(editing.id,{},e.target.value)}/>
      </label>
      <div className="font-row">
        <label>Heading font
          <select value={editing.params.headingFont} onChange={e=>onUpdate(editing.id,{headingFont:e.target.value})}>
            {FONT_OPTIONS.map(f=><option key={f}>{f}</option>)}
          </select>
        </label>
        <label>Body font
          <select value={editing.params.bodyFont} onChange={e=>onUpdate(editing.id,{bodyFont:e.target.value})}>
            {FONT_OPTIONS.map(f=><option key={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <div className="range-row">
        <label>Size <b>{editing.params.size}px</b>
          <input type="range" min="28" max="76" value={editing.params.size} onChange={e=>onUpdate(editing.id,{size:Number(e.target.value)})}/>
        </label>
        <label>Weight <b>{editing.params.weight}</b>
          <input type="range" min="300" max="800" step="100" value={editing.params.weight} onChange={e=>onUpdate(editing.id,{weight:Number(e.target.value)})}/>
        </label>
      </div>
      <div className="range-row">
        <label>Line height <b>{editing.params.leading.toFixed(2)}</b>
          <input type="range" min="1" max="1.8" step=".05" value={editing.params.leading} onChange={e=>onUpdate(editing.id,{leading:Number(e.target.value)})}/>
        </label>
        <label>Letter spacing <b>{editing.params.tracking}px</b>
          <input type="range" min="-1" max="3" step=".5" value={editing.params.tracking} onChange={e=>onUpdate(editing.id,{tracking:Number(e.target.value)})}/>
        </label>
      </div>
      <div className="style-edit-foot">
        <span>修改会实时同步到所有使用此样式的配对</span>
        <button className="save" onClick={()=>setEditingId(null)}><Check size={13}/>完成</button>
      </div>
    </div>}

    {saving&&<div className="backdrop" onClick={()=>setSaving(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>存为命名样式</h2>
        <p className="modal-note">把当前编辑器的这组参数保存为可复用样式，之后可应用到任意配对。</p>
        <label>样式名称<input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Quiet confidence"/></label>
        <div className="modal-actions">
          <button className="outline" onClick={()=>setSaving(false)}>取消</button>
          <button className="primary" onClick={save}>保存并应用</button>
        </div>
      </div>
    </div>}

    {deleting&&<div className="backdrop" onClick={()=>setDeletingId(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>移除样式「{deleting.name}」</h2>
        {deletingUsage>0?<>
          <p className="modal-note">{deletingUsage} 个配对正在使用此样式。移除前必须为它们选择去向，不能留空。</p>
          <label>这些配对改绑到
            <select value={rebindTo} onChange={e=>setRebindTo(e.target.value)}>
              <option value={DEFAULT_STYLE.id}>默认样式（恢复默认，清除单独调整）</option>
              {styles.filter(s=>s.id!==deleting.id&&s.id!==DEFAULT_STYLE.id).map(s=>
                <option key={s.id} value={s.id}>{s.name}（保留单独调整）</option>)}
            </select>
          </label>
        </>:<p className="modal-note">没有配对使用此样式，可以直接移除。</p>}
        <div className="modal-actions">
          <button className="outline" onClick={()=>setDeletingId(null)}>取消</button>
          <button className="primary" onClick={confirmRemove}>移除样式</button>
        </div>
      </div>
    </div>}
  </section>;
}
