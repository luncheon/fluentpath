(()=>{var G=class{constructor(t){this.t=t,this.i=10**this.t}h(t){return this.t<16?Math.round(t*this.i)/this.i:t}o(t,e){return this.h(t)+","+this.h(e)}},E=class{constructor(t,e){this.x=t,this.y=e}u(){return new E(-this.x,-this.y)}l(t=1){return this._(t/(this.M()||1/0))}g(t){return new E(this.x+t.x,this.y+t.y)}v(t){return new E(this.x-t.x,this.y-t.y)}_(t){return new E(this.x*t,this.y*t)}m(t){return this.x*t.x+this.y*t.y}M(){return Math.sqrt(this.x*this.x+this.y*this.y)}p(t){let e=this.x-t.x,n=this.y-t.y;return Math.sqrt(e*e+n*n)}},k=class{constructor(t,e){this.C=t,this.L=e}},_=class{constructor(t,e){this.k=t,this.B=e}D(t){let e=this.k;this.B&&(e.unshift(e[e.length-1]),e.push(e[1]));let n=e.length;if(n===0)return[];let r=[new k(e[0])];return this.P(r,t,0,n-1,e[1].v(e[0]),e[n-2].v(e[n-1])),this.B&&(r.shift(),r.pop()),r}P(t,e,n,r,s,o){let h=this.k;if(r-n==1){let m=h[n],c=h[r],p=m.p(c)/3;return void this.R(t,[m,m.g(s.l(p)),c.g(o.l(p)),c])}let d=this.j(n,r),l,u=Math.max(e,e*e),a=!0;for(let m=0;m<=4;m++){let c=this.q(n,r,d,s,o),p=this.A(n,r,c,d);if(p.error<e&&a)return void this.R(t,c);if(l=p.index,p.error>=u)break;a=this.F(n,r,d,c),u=p.error}let i=h[l-1].v(h[l+1]);this.P(t,e,n,l,s,i),this.P(t,e,l,r,i.u(),o)}R(t,e){t[t.length-1].G=e[1].v(e[0]),t.push(new k(e[3],e[2].v(e[3])))}q(t,e,n,r,s){let o=1e-12,h=Math.abs,d=this.k,l=d[t],u=d[e],a=[[0,0],[0,0]],i=[0,0];for(let f=0,x=e-t+1;f<x;f++){let P=n[f],M=1-P,S=3*P*M,q=M*M*M,$=S*M,A=S*P,R=P*P*P,L=r.l($),C=s.l(A),D=d[t+f].v(l._(q+$)).v(u._(A+R));a[0][0]+=L.m(L),a[0][1]+=L.m(C),a[1][0]=a[0][1],a[1][1]+=C.m(C),i[0]+=L.m(D),i[1]+=C.m(D)}let m=a[0][0]*a[1][1]-a[1][0]*a[0][1],c,p;if(h(m)>o){let f=a[0][0]*i[1]-a[1][0]*i[0];c=(i[0]*a[1][1]-i[1]*a[0][1])/m,p=f/m}else{let f=a[0][0]+a[0][1],x=a[1][0]+a[1][1];c=p=h(f)>o?i[0]/f:h(x)>o?i[1]/x:0}let y=u.p(l),g=o*y,b,w;if(c<g||p<g)c=p=y/3;else{let f=u.v(l);b=r.l(c),w=s.l(p),b.m(f)-w.m(f)>y*y&&(c=p=y/3,b=w=null)}return[l,l.g(b||r.l(c)),u.g(w||s.l(p)),u]}F(t,e,n,r){for(let s=t;s<=e;s++)n[s-t]=this.H(r,this.k[s],n[s-t]);for(let s=1,o=n.length;s<o;s++)if(n[s]<=n[s-1])return!1;return!0}H(t,e,n){let r=[],s=[];for(let i=0;i<=2;i++)r[i]=t[i+1].v(t[i])._(3);for(let i=0;i<=1;i++)s[i]=r[i+1].v(r[i])._(2);let o=this.I(3,t,n),h=this.I(2,r,n),d=this.I(1,s,n),l=o.v(e),u=h.m(h)+l.m(d);return(a=u)>=-112e-18&&a<=112e-18?n:n-l.m(h)/u;var a}I(t,e,n){let r=e.slice();for(let s=1;s<=t;s++)for(let o=0;o<=t-s;o++)r[o]=r[o]._(1-n).g(r[o+1]._(n));return r[0]}j(t,e){let n=[0];for(let r=t+1;r<=e;r++)n[r-t]=n[r-t-1]+this.k[r].p(this.k[r-1]);for(let r=1,s=e-t;r<=s;r++)n[r]/=n[s];return n}A(t,e,n,r){let s=Math.floor((e-t+1)/2),o=0;for(let h=t+1;h<e;h++){let d=this.I(3,n,r[h-t]).v(this.k[h]),l=d.x*d.x+d.y*d.y;l>=o&&(o=l,s=h)}return{error:o,index:s}}},I=(v,t={})=>((e,n,r)=>{let s=e.length,o=new G(r),h,d,l,u,a=!0,i=[],m=(c,p)=>{let y=c.C.x,g=c.C.y;if(a)i.push("M"+o.o(y,g)),a=!1;else{let b=y+(c.L?.x??0),w=g+(c.L?.y??0);if(b===y&&w===g&&l===h&&u===d){if(!p){let f=y-h,x=g-d;i.push(f===0?"v"+o.h(x):x===0?"h"+o.h(f):"l"+o.o(f,x))}}else i.push("c"+o.o(l-h,u-d)+" "+o.o(b-h,w-d)+" "+o.o(y-h,g-d))}h=y,d=g,l=y+(c.G?.x??0),u=g+(c.G?.y??0)};if(!s)return"";for(let c=0;c<s;c++)m(e[c]);return n&&s>0&&(m(e[0],!0),i.push("z")),i.join("")})(new _(v.map(e=>new E(e[0],e[1])),t.closed).D(t.tolerance??2.5),t.closed,t.precision??5);var F=class{constructor(t,e){this.path=t;this.smoothingPointCount=e?.smoothingPointCount??4,this.distanceThreshold=e?.distanceThreshold??4,this.inertiaFactor=e?.inertiaFactor??.1,this.tolerance=e?.tolerance??2.5,this.precision=e?.precision??5}smoothingPointCount;distanceThreshold;inertiaFactor;tolerance;precision;lastNPointers=[];points=[];get d(){return this.path.getAttribute("d")??""}set d(t){this.path.setAttribute("d",t)}add(t){let{lastNPointers:e,points:n}=this;if(e.unshift(t),e.length===1)this.d=`M${t.x} ${t.y}v0`,n.push([t.x,t.y]);else{e.length>this.smoothingPointCount&&e.pop();let r=e.reduce((l,u)=>l+u.x,0)/e.length,s=e.reduce((l,u)=>l+u.y,0)/e.length,[o,h]=n[n.length-1];if(Math.hypot(o-r,h-s)>this.distanceThreshold){if(n.length>3){let[l,u]=n[n.length-3],[a,i]=n[n.length-2],m=Math.hypot(o-a,h-i)*this.inertiaFactor,c=m/Math.hypot(a-l,i-u),p=m/Math.hypot(o-r,h-s);this.d+=`C${a+(a-l)*c} ${i+(i-u)*c} ${o+(o-r)*p} ${h+(h-s)*p} ${o} ${h}`}n.push([r,s])}}return this}end(){let{path:t,points:e}=this,n=t.getTotalLength();if(n>3){let r=[],s=Math.max(.2,Math.min(8,n*.01));for(let h=0;h<n;h+=s){let{x:d,y:l}=t.getPointAtLength(h);r.push([d,l])}let o=t.getPointAtLength(n);r.push([o.x,o.y]),r.push(e[e.length-1]),t.setAttribute("d",I(r,{tolerance:this.tolerance,precision:this.precision}))}return this}};var T=v=>v.target.closest("svg[data-fluentpath]"),V=+new URLSearchParams(location.search).get("inertia")||.15;addEventListener("pointerdown",v=>{if(v.button!==0)return;let t=T(v);if(!t)return;let e=t.getCTM().a*visualViewport.scale,n=t.getScreenCTM().inverse(),r=i=>new DOMPoint(i.clientX,i.clientY).matrixTransform(n),s=document.createElementNS("http://www.w3.org/2000/svg","path"),o=new F(s,{distanceThreshold:4/e,tolerance:1/e,precision:e>2?2:1,inertiaFactor:V}).add(r(v)),h=i=>o.add(r(i)),d=i=>{a(),o.add(r(i)).end(),s.dispatchEvent(new CustomEvent("fluentpath:drawend",{bubbles:!0}))},l=i=>i.keyCode===27&&u(),u=()=>{a(),s.remove()},a=()=>{removeEventListener("pointerdown",u,!0),removeEventListener("pointermove",h),removeEventListener("pointerup",d,!0),removeEventListener("pointercancel",u,!0),removeEventListener("keydown",l)};addEventListener("pointerdown",u,!0),addEventListener("pointermove",h),addEventListener("pointerup",d,!0),addEventListener("pointercancel",u,!0),addEventListener("keydown",l),t.appendChild(s).dispatchEvent(new CustomEvent("fluentpath:drawstart",{bubbles:!0})),v.preventDefault()},{passive:!1});"GestureEvent"in self&&(addEventListener("touchmove",v=>v.touches.length===1&&T(v)&&v.preventDefault(),{passive:!1}),addEventListener("touchend",v=>T(v)&&v.preventDefault(),{passive:!1}));})();
