import{useState}from'react';
import{BookOpen,ChevronDown,Download,Grid3X3,Heart,Plus,Settings2,Star,Trash2,Type}from'lucide-react';
import{DEFAULT_STYLE,resolveParams,useStyleLibrary}from'./styleLibrary';
import{usePairings}from'./pairings';
import PairingEditor from'./components/PairingEditor';
import StyleLibraryPanel from'./components/StyleLibraryPanel';

export default function App(){
  const{styles,createStyle,updateStyle,removeStyle}=useStyleLibrary();
  const{pairs,addPair,removePair,toggleFavorite,bindStyle,setOverride,clearOverrides,rebindStyle,usageOf}=usePairings(styles);
  const[selected,setSelected]=useState(()=>pairs[0]?.id??0);
  const[showAdd,setShowAdd]=useState(false);
  const[newTitle,setNewTitle]=useState('');

  const current=pairs.find(p=>p.id===selected)??pairs[0];
  const currentStyle=styles.find(s=>s.id===current?.styleId)??DEFAULT_STYLE;
  const effective=current?resolveParams(currentStyle,current.overrides):DEFAULT_STYLE.params;

  const create=()=>{
    if(!newTitle.trim())return;
    const id=addPair(newTitle.trim());
    setSelected(id);setNewTitle('');setShowAdd(false);
  };
  const exportCss=()=>{
    if(!current)return;
    const css=`/* ${current.title} · style: ${currentStyle.name} */\n.heading { font-family: '${effective.headingFont}'; font-size: ${effective.size}px; font-weight: ${effective.weight}; letter-spacing: ${effective.tracking}px; }\n.body { font-family: '${effective.bodyFont}'; line-height: ${effective.leading}; letter-spacing: ${effective.tracking/2}px; }`;
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([css],{type:'text/css'}));
    a.download='type-pair.css';a.click();URL.revokeObjectURL(a.href);
  };
  /** 存为命名样式并应用到当前配对；参数与样式一致，覆盖层随之清空 */
  const saveAsStyle=(name:string)=>{
    const style=createStyle(name,effective);
    if(current)bindStyle(current.id,style.id,true);
  };
  /** 移除样式：有使用者时先整体改绑（或恢复默认），再删除，绝不留下空引用 */
  const removeStyleWithRebind=(id:string,rebindTo?:string)=>{
    if(rebindTo)rebindStyle(id,rebindTo);
    removeStyle(id);
  };

  return<div className="app">
    <aside>
      <div className="brand"><div className="brand-mark"><Type size={18}/></div><div><b>Type Pairer</b><small>FIND YOUR VOICE</small></div></div>
      <div className="nav-section"><span>LIBRARY</span>
        <button className="nav active"><Grid3X3 size={16}/>All pairings <b>{pairs.length}</b></button>
        <button className="nav"><Heart size={16}/>Favorites <b>{pairs.filter(p=>p.favorite).length}</b></button>
      </div>
      <div className="saved"><div className="saved-head"><span>COLLECTIONS</span><button onClick={()=>setShowAdd(true)}><Plus size={14}/></button></div>
        <button className="collection"><i style={{background:'#e8b7a0'}}/>Editorial <b>4</b></button>
        <button className="collection"><i style={{background:'#9fc9be'}}/>Portfolio <b>3</b></button>
        <button className="collection"><i style={{background:'#b4add8'}}/>Brand voice <b>5</b></button>
      </div>
      <div className="aside-foot">
        <button className="nav"><Settings2 size={16}/>Preferences</button>
        <div className="profile"><div className="avatar">YL</div><div><b>Yuki Lin</b><small>Design workspace</small></div><ChevronDown size={14}/></div>
      </div>
    </aside>
    <main>
      <header>
        <div>
          <div className="crumb">TYPE LIBRARY / <b>PAIRING STUDIO</b></div>
          <h1>Find the right conversation.</h1>
          <p>Explore combinations, tune the details, and save what feels like you.</p>
        </div>
        <div className="actions">
          <button className="outline" onClick={exportCss}><Download size={15}/>Copy CSS</button>
          <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/>New pairing</button>
        </div>
      </header>
      <div className="layout">
        <section className="gallery">
          <div className="gallery-head">
            <div><h2>Saved pairings</h2><span>{pairs.length} compositions</span></div>
            <div className="view-toggle"><button className="on"><Grid3X3 size={14}/></button><button><BookOpen size={14}/></button></div>
          </div>
          <div className="pair-list">{pairs.map(p=>{
            const cardParams=resolveParams(styles.find(s=>s.id===p.styleId),p.overrides);
            const cardStyle=styles.find(s=>s.id===p.styleId)??DEFAULT_STYLE;
            return<button key={p.id} className={selected===p.id?'pair selected':'pair'} onClick={()=>setSelected(p.id)}>
              <div className="pair-top"><span>{p.category} · {cardStyle.name}</span><Heart size={15} fill={p.favorite?'#e88769':'none'} color={p.favorite?'#e88769':'#aeb5b7'}/></div>
              <strong style={{fontFamily:cardParams.headingFont}}>{p.heading}</strong>
              <p style={{fontFamily:cardParams.bodyFont}}>{p.body}</p>
              <div className="pair-foot"><span>{p.title}</span><small>Open canvas →</small></div>
            </button>;
          })}</div>
        </section>
        <section className="studio">
          {current?<>
            <div className="studio-head">
              <div><span>PAIRING CANVAS</span><h2>{current.title}</h2></div>
              <button className="favorite" onClick={()=>toggleFavorite(current.id)}><Star size={16} fill={current.favorite?'#e5a35e':'none'} color={current.favorite?'#e5a35e':'#98a4a7'}/></button>
            </div>
            <div className="canvas">
              <div className="canvas-bar"><span>PREVIEW</span><div><button>Desktop</button><button>Tablet</button><button>Mobile</button></div></div>
              <div className="preview">
                <span className="preview-kicker">A NOTE ON TYPE</span>
                <h3 style={{fontFamily:effective.headingFont,fontSize:`${effective.size}px`,fontWeight:effective.weight,letterSpacing:`${effective.tracking}px`,lineHeight:1.05}}>{current.heading}</h3>
                <p style={{fontFamily:effective.bodyFont,lineHeight:effective.leading,letterSpacing:`${effective.tracking/2}px`}}>{current.body}</p>
                <div className="preview-rule"/>
                <span className="preview-meta">PAIRING 0{current.id} · {current.category.toUpperCase()} · {currentStyle.name.toUpperCase()}</span>
              </div>
            </div>
            <PairingEditor
              value={effective}
              styles={styles}
              styleId={current.styleId}
              overrideCount={Object.keys(current.overrides).length}
              onBind={styleId=>bindStyle(current.id,styleId)}
              onChange={patch=>setOverride(current.id,patch)}
              onClearOverrides={()=>clearOverrides(current.id)}
            />
            <StyleLibraryPanel
              styles={styles}
              currentParams={effective}
              boundStyleId={current.styleId}
              usageOf={usageOf}
              onApply={styleId=>bindStyle(current.id,styleId)}
              onCreate={saveAsStyle}
              onUpdate={updateStyle}
              onRemove={removeStyleWithRebind}
            />
            <div className="studio-foot">
              <button className="delete" onClick={()=>{removePair(current.id);setSelected(pairs.find(p=>p.id!==current.id)?.id||0)}}><Trash2 size={15}/>Delete pairing</button>
              <button className="save"><CheckIcon/>Saved locally</button>
            </div>
          </>:<div className="empty-studio">
            <h2>No pairings yet</h2>
            <p>Create a pairing to start exploring type combinations.</p>
            <button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/>New pairing</button>
          </div>}
        </section>
      </div>
    </main>
    {showAdd&&<div className="backdrop" onClick={()=>setShowAdd(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2>New pairing</h2>
        <label>Pairing name<input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Quiet confidence"/></label>
        <div className="modal-actions">
          <button className="outline" onClick={()=>setShowAdd(false)}>Cancel</button>
          <button className="primary" onClick={create}>Create pairing</button>
        </div>
      </div>
    </div>}
  </div>;
}
function CheckIcon(){return<span className="check">✓</span>}
