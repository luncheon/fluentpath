(()=>{var G=class{constructor(t){this.t=t,this.i=10**this.t}h(t){return this.t<16?Math.round(t*this.i)/this.i:t}o(t,e){return this.h(t)+","+this.h(e)}},E=class{constructor(t,e){this.x=t,this.y=e}u(){return new E(-this.x,-this.y)}l(t=1){return this._(t/(this.M()||1/0))}g(t){return new E(this.x+t.x,this.y+t.y)}v(t){return new E(this.x-t.x,this.y-t.y)}_(t){return new E(this.x*t,this.y*t)}m(t){return this.x*t.x+this.y*t.y}M(){return Math.sqrt(this.x*this.x+this.y*this.y)}p(t){let e=this.x-t.x,r=this.y-t.y;return Math.sqrt(e*e+r*r)}},k=class{constructor(t,e){this.C=t,this.L=e}},D=class{constructor(t,e){this.k=t,this.B=e}D(t){let e=this.k;this.B&&(e.unshift(e[e.length-1]),e.push(e[1]));let r=e.length;if(r===0)return[];let n=[new k(e[0])];return this.P(n,t,0,r-1,e[1].v(e[0]),e[r-2].v(e[r-1])),this.B&&(n.shift(),n.pop()),n}P(t,e,r,n,s,o){let i=this.k;if(n-r==1){let m=i[r],a=i[n],v=m.p(a)/3;return void this.R(t,[m,m.g(s.l(v)),a.g(o.l(v)),a])}let c=this.j(r,n),l,p=Math.max(e,e*e),u=!0;for(let m=0;m<=4;m++){let a=this.q(r,n,c,s,o),v=this.A(r,n,a,c);if(v.error<e&&u)return void this.R(t,a);if(l=v.index,v.error>=p)break;u=this.F(r,n,c,a),p=v.error}let h=i[l-1].v(i[l+1]);this.P(t,e,r,l,s,h),this.P(t,e,l,n,h.u(),o)}R(t,e){t[t.length-1].G=e[1].v(e[0]),t.push(new k(e[3],e[2].v(e[3])))}q(t,e,r,n,s){let o=1e-12,i=Math.abs,c=this.k,l=c[t],p=c[e],u=[[0,0],[0,0]],h=[0,0];for(let y=0,w=e-t+1;y<w;y++){let M=r[y],L=1-M,F=3*M*L,q=L*L*L,T=F*L,_=F*M,B=M*M*M,A=n.l(T),P=s.l(_),$=c[t+y].v(l._(q+T)).v(p._(_+B));u[0][0]+=A.m(A),u[0][1]+=A.m(P),u[1][0]=u[0][1],u[1][1]+=P.m(P),h[0]+=A.m($),h[1]+=P.m($)}let m=u[0][0]*u[1][1]-u[1][0]*u[0][1],a,v;if(i(m)>o){let y=u[0][0]*h[1]-u[1][0]*h[0];a=(h[0]*u[1][1]-h[1]*u[0][1])/m,v=y/m}else{let y=u[0][0]+u[0][1],w=u[1][0]+u[1][1];a=v=i(y)>o?h[0]/y:i(w)>o?h[1]/w:0}let f=p.p(l),g=o*f,b,x;if(a<g||v<g)a=v=f/3;else{let y=p.v(l);b=n.l(a),x=s.l(v),b.m(y)-x.m(y)>f*f&&(a=v=f/3,b=x=null)}return[l,l.g(b||n.l(a)),p.g(x||s.l(v)),p]}F(t,e,r,n){for(let s=t;s<=e;s++)r[s-t]=this.H(n,this.k[s],r[s-t]);for(let s=1,o=r.length;s<o;s++)if(r[s]<=r[s-1])return!1;return!0}H(t,e,r){let n=[],s=[];for(let h=0;h<=2;h++)n[h]=t[h+1].v(t[h])._(3);for(let h=0;h<=1;h++)s[h]=n[h+1].v(n[h])._(2);let o=this.I(3,t,r),i=this.I(2,n,r),c=this.I(1,s,r),l=o.v(e),p=i.m(i)+l.m(c);return(u=p)>=-112e-18&&u<=112e-18?r:r-l.m(i)/p;var u}I(t,e,r){let n=e.slice();for(let s=1;s<=t;s++)for(let o=0;o<=t-s;o++)n[o]=n[o]._(1-r).g(n[o+1]._(r));return n[0]}j(t,e){let r=[0];for(let n=t+1;n<=e;n++)r[n-t]=r[n-t-1]+this.k[n].p(this.k[n-1]);for(let n=1,s=e-t;n<=s;n++)r[n]/=r[s];return r}A(t,e,r,n){let s=Math.floor((e-t+1)/2),o=0;for(let i=t+1;i<e;i++){let c=this.I(3,r,n[i-t]).v(this.k[i]),l=c.x*c.x+c.y*c.y;l>=o&&(o=l,s=i)}return{error:o,index:s}}},O=(d,t={})=>((e,r,n)=>{let s=e.length,o=new G(n),i,c,l,p,u=!0,h=[],m=(a,v)=>{let f=a.C.x,g=a.C.y;if(u)h.push("M"+o.o(f,g)),u=!1;else{let b=f+(a.L?.x??0),x=g+(a.L?.y??0);if(b===f&&x===g&&l===i&&p===c){if(!v){let y=f-i,w=g-c;h.push(y===0?"v"+o.h(w):w===0?"h"+o.h(y):"l"+o.o(y,w))}}else h.push("c"+o.o(l-i,p-c)+" "+o.o(b-i,x-c)+" "+o.o(f-i,g-c))}i=f,c=g,l=f+(a.G?.x??0),p=g+(a.G?.y??0)};if(!s)return"";for(let a=0;a<s;a++)m(e[a]);return r&&s>0&&(m(e[0],!0),h.push("z")),h.join("")})(new D(d.map(e=>new E(e[0],e[1])),t.closed).D(t.tolerance??2.5),t.closed,t.precision??5);var S=class{constructor(t,e){this.path=t;this.distanceThreshold=e?.distanceThreshold??4,this.inertiaFactor=e?.inertiaFactor??.15,this.tolerance=e?.tolerance??2.5,this.precision=e?.precision??5}distanceThreshold;inertiaFactor;tolerance;precision;points=[];wma;prev;_d="";add({x:t,y:e}){let{path:r,points:n,prev:s,wma:o}=this;if(s&&Math.hypot(s[0]-t,s[1]-e)<this.distanceThreshold)return this;if(this.prev=[t,e],o){let[i,c]=this.wma=[(o[0]+t)*.5,(o[1]+e)*.5],[l,p]=n[n.length-1],u=Math.hypot(i-l,c-p);if(u>this.distanceThreshold){if(n.length>3){let[h,m]=n[n.length-3],[a,v]=n[n.length-2],f=Math.hypot(l-a,p-v)*this.inertiaFactor,g=f/Math.hypot(a-h,v-m),b=f/u;this._d+=`C${a+(a-h)*g} ${v+(v-m)*g} ${l+(l-i)*b} ${p+(p-c)*b} ${l} ${p}`}r.setAttribute("d",`${this._d}L${i} ${c}`),n.push([i,c])}}else{let i=10**this.precision,c=l=>Math.round(l*i)/i;r.setAttribute("d",`${this._d=`M${c(t)} ${c(e)}`}v0`),n.push(this.wma=[t,e])}return this}end(){let{path:t}=this,e=t.getTotalLength();if(e!==0){let r=[],n=Math.max(.2,Math.min(8,e*.01));for(let o=0;o<e;o+=n){let i=t.getPointAtLength(o);r.push([i.x,i.y])}let s=t.getPointAtLength(e);r.push([s.x,s.y]),t.setAttribute("d",O(r,{tolerance:this.tolerance,precision:this.precision}))}return this}};var C=d=>{let t=d.target.closest("svg[data-fluentpath]"),e={},r=t?.getAttribute("data-fluentpath");if(r)for(let n of r.split(";")??[]){let s=n.indexOf(":"),o=n.slice(0,s).trim().replace(/[a-zA-Z0-9_]-[a-z]/g,i=>i[0]+i[2].toUpperCase());o&&(e[o]=+n.slice(s+1).trim())}return[t,e]},I=(()=>{let d=document.createElementNS("http://www.w3.org/2000/svg","circle");return d.setAttribute("stroke","none"),d.setAttribute("fill","red"),d.setAttribute("r","3"),d.setAttribute("opacity","0.2"),d.style.transition="opacity 8s ease-out",t=>{let e=d.cloneNode();return e.setAttribute("cx",t.x),e.setAttribute("cy",t.y),t.color&&e.setAttribute("fill",t.color),requestAnimationFrame(()=>e.setAttribute("opacity","0.04")),setTimeout(()=>e.remove(),16e3),e}})();addEventListener("pointerdown",d=>{if(d.button!==0)return;let[t,e]=C(d);if(!t)return;let r=t.getScreenCTM().inverse(),n=h=>{let m=new DOMPoint(h.clientX,h.clientY).matrixTransform(r);return t.appendChild(I(m)),m},s=document.createElementNS("http://www.w3.org/2000/svg","path"),o=new S(s,e).add(n(d));console.log(new Date().toISOString().replace(/.*T(.*)Z/,(h,m)=>m),o);let i=h=>{let{points:m}=o,a=m.length;if(o.add(n(h)),m.length>a){let[v,f]=m[m.length-1];t.appendChild(I({x:v,y:f,color:"blue"}))}},c=h=>{u(),o.add(n(h)).end(),s.dispatchEvent(new CustomEvent("fluentpath:drawend",{bubbles:!0}))},l=h=>h.keyCode===27&&p(),p=()=>{u(),s.remove()},u=()=>{removeEventListener("pointerdown",p,!0),removeEventListener("pointermove",i),removeEventListener("pointerup",c,!0),removeEventListener("pointercancel",p,!0),removeEventListener("keydown",l)};addEventListener("pointerdown",p,!0),addEventListener("pointermove",i),addEventListener("pointerup",c,!0),addEventListener("pointercancel",p,!0),addEventListener("keydown",l),t.appendChild(s).dispatchEvent(new CustomEvent("fluentpath:drawstart",{bubbles:!0})),d.preventDefault()},{passive:!1});"GestureEvent"in self&&(addEventListener("touchmove",d=>d.touches.length===1&&C(d)&&d.preventDefault(),{passive:!1}),addEventListener("touchend",d=>C(d)&&d.preventDefault(),{passive:!1}));})();
