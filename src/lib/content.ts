import { z } from 'astro/zod';
import { escapeHtml, renderCalendar } from './calendar.mjs';
import rawSite from '../data/site.json';
import rawSchedule from '../data/schedule.json';
import rawNotices from '../data/notices.json';
import rawMaterials from '../data/materials.json';
const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v},'Data inválida');
const id=z.string().regex(/^[a-z0-9-]+$/);
const safeUrl=z.string().refine(v=>/^\/(?!\/)/.test(v)||/^https:\/\//.test(v),'Use um caminho local ou HTTPS');
export const site=z.object({name:z.string(),shortName:z.string(),address:z.string(),district:z.string(),city:z.string(),state:z.string(),postalCode:z.string(),email:z.email(),cnpj:z.string(),contentVerified:z.boolean()}).parse(rawSite);
export const scheduleSchema=z.object({appointments:z.array(z.object({id,title:z.string().min(1),weekday:z.number().int().min(0).max(6),time,tickets:z.string(),capacity:z.string(),description:z.string(),instructions:z.string(),active:z.boolean()})),exceptions:z.array(z.object({appointmentId:id,date,status:z.enum(['cancelled','special']),time:time.optional(),message:z.string().min(1)}))}).superRefine((data,ctx)=>{
 const ids=data.appointments.map(a=>a.id);if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'IDs de atendimento duplicados'});
 const keys=new Set();for(const e of data.exceptions){if(!ids.includes(e.appointmentId))ctx.addIssue({code:'custom',message:'Atendimento da exceção não existe'});const key=e.appointmentId+e.date;if(keys.has(key))ctx.addIssue({code:'custom',message:'Exceção duplicada'});keys.add(key);if(e.status==='special'&&!e.time)ctx.addIssue({code:'custom',message:'Informe o horário especial'});const a=data.appointments.find(a=>a.id===e.appointmentId);if(a&&new Date(e.date+'T12:00:00Z').getUTCDay()!==a.weekday)ctx.addIssue({code:'custom',message:'A data da exceção deve corresponder ao dia do atendimento'});}
});
export const schedule=scheduleSchema.parse(rawSchedule);
export const notices=z.object({items:z.array(z.object({title:z.string().min(1),message:z.string().min(1),active:z.boolean(),start:date.optional(),end:date.optional()}).refine(n=>!n.start||!n.end||n.start<=n.end,'O fim deve ser posterior ao início'))}).parse(rawNotices);
export const materials=z.object({items:z.array(z.object({title:z.string().min(1),description:z.string(),file:safeUrl}))}).parse(rawMaterials);
const pageSchema=z.object({title:z.string(),texts:z.array(z.object({id,label:z.string(),text:z.string()})),images:z.array(z.object({id,label:z.string(),src:safeUrl,alt:z.string()}))});
const templates=import.meta.glob('../templates/*.html',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
const pages=import.meta.glob('../data/pages/*.json',{import:'default',eager:true});
export function renderPage(key:string) {
 const page=pageSchema.parse(pages[`../data/pages/${key}.json`]);
 const texts=new Map(page.texts.map(t=>[t.id,t.text]));const images=new Map(page.images.map(i=>[i.id,i]));
 let template=templates[`../templates/${key}.html`];if(!template)throw new Error(`Template ausente: ${key}`);
 template=template.replace(/\[\[text:([^\]]+)\]\]/g,(_,id)=>{if(!texts.has(id))throw new Error(`Texto ausente: ${key}/${id}`);let text=texts.get(id)!;text=text.replace(/Rua Cel\. Zacarias Xavier, 88/g,site.address).replace(/826(?:00-090|20-180)/g,site.postalCode).replace(/Tingui/g,site.district).replace(/Curitiba/g,site.city).replace(/\bPR\b/g,site.state).replace(/contato@cecop.org.br/g,site.email).replace(/86\.908\.589\/0001-46/g,site.cnpj);return escapeHtml(text)}).replace(/\[\[image:([^:]+):(src|alt)\]\]/g,(_,id,field)=>{const image=images.get(id);if(!image)throw new Error(`Imagem ausente: ${id}`);return escapeHtml(image[field as 'src'|'alt'])});
 template=template.replace('[[calendar]]',renderCalendar(schedule)).replace('[[footer-schedule]]',schedule.appointments.filter(a=>a.active).map(a=>`<p class="text-sm mb-2"><a class="underline" href="/programacao/">${escapeHtml(a.title)} — ${escapeHtml(a.time)}</a></p>`).join(''));
 const address=[site.address,site.district,site.city,site.state].join(', ');
 template=template.replace(/href="https:\/\/(?:www\.)?(?:maps\.google\.com|google\.com\/maps)[^"]*"/g,`href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(address)}"`);
 return template;
}
