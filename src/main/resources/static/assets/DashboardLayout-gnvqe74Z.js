import{j as s}from"./ui-DCtcd1Kk.js";import{S as l,C as h,U as m}from"./Sidebar-CR8TwwPA.js";import{c as o,R as d,C as f}from"./RootLayout-Bf31PLGy.js";import{u}from"./index-XEsyHGvM.js";import{A as p}from"./arrow-right-left-DbfiJvWz.js";/**
 * @license lucide-react v0.501.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],y=o("circle-plus",x);/**
 * @license lucide-react v0.501.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]],v=o("house",A),L=({children:c,showFooter:r=!1})=>{var t;const{user:a}=u(),i=(t=a==null?void 0:a.roles)==null?void 0:t.some(n=>n==="ROLE_ADMIN"),e=[{title:"Dashboard",href:"/dashboard",icon:v},{title:"Analytics",href:"/analytics",icon:h},{title:"Accounts",href:"/accounts",icon:f},{title:"Transfer",href:"/transfer",icon:p},{title:"Create Account",href:"/accounts/create",icon:y}];return i&&e.push({title:"Admin",href:"/admin",icon:m}),s.jsx(d,{showFooter:r,children:s.jsxs("div",{className:"flex min-h-[calc(100vh-64px)]",children:[s.jsx(l,{items:e}),s.jsx("div",{className:"pl-64 w-full",children:s.jsx("main",{className:"p-6",children:c})})]})})};export{y as C,L as D};
