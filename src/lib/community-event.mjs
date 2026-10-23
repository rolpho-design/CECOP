import {escapeHtml,localClock} from './calendar.mjs';
export function eventIsUpcoming(event, now = new Date()) {
 return event.active && event.nextDate>=localClock(now).date;
}
export function renderCommunityEvent(event,now=new Date()) {
 const upcoming=eventIsUpcoming(event,now);
 if(!event.active)return '';
 const date=new Date(event.nextDate+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC',day:'2-digit',month:'long',year:'numeric'});
 const time=event.startTime?event.startTime.replace(':','h')+(event.endTime?' às '+event.endTime.replace(':','h'):''):'';
 const price=event.price!=null?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(event.price):'';
 return `<section id="tarde-do-pastel" class="w-full py-16 lg:py-20 bg-surface-container-low"><div class="max-w-[1200px] mx-auto px-gutter-mobile lg:px-gutter"><div class="grid md:grid-cols-3 gap-8 items-center rounded-lg bg-surface-container-lowest border border-outline-variant/40 p-8 lg:p-12"><div class="md:col-span-2"><p class="font-badge-label text-badge-label uppercase tracking-widest text-tertiary-container mb-3">Encontro da comunidade</p><h2 class="font-headline-lg text-headline-lg text-primary mb-4">${escapeHtml(event.title)}</h2><p class="text-body-default text-on-surface-variant mb-5">${escapeHtml(event.description)}</p><a class="inline-flex px-6 py-3 rounded-full bg-primary text-on-primary font-button text-button hover:bg-primary-container" href="/contato-e-localizacao/">Contato e localização <span aria-hidden="true" class="ml-2">→</span></a></div><div class="rounded-lg bg-secondary-fixed/40 p-7"><span aria-hidden="true" class="material-symbols-outlined text-primary text-4xl mb-3">bakery_dining</span>${upcoming?`<p class="text-caption text-secondary mb-2">Próxima edição</p><p class="font-headline-md text-headline-md text-primary"><time datetime="${escapeHtml(event.nextDate)}">${escapeHtml(date)}</time></p>${time?`<p class="mt-3">${escapeHtml(time)}</p>`:''}${price?`<p class="mt-2 font-semibold">Pastel: ${escapeHtml(price)}</p>`:''}`:'<p class="font-semibold text-primary">A próxima data será divulgada em breve.</p>'}</div></div></div></section>`;
}
