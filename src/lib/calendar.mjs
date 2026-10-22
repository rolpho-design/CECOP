export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function localClock(now = new Date()) {
 const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 return { date:`${parts.year}-${parts.month}-${parts.day}`, time:`${parts.hour}:${parts.minute}` };
}
export function nextOccurrence(appointment, exceptions, now = new Date()) {
 const clock=localClock(now);
 const base=new Date(clock.date+'T12:00:00Z');
 // Include today's special time before deciding whether today's occurrence passed.
 for(let offset=0;offset<15;offset++) {
  const day=new Date(base);day.setUTCDate(day.getUTCDate()+offset);
  if(day.getUTCDay()!==appointment.weekday)continue;
  const date=day.toISOString().slice(0,10);
  const exception=exceptions.find(e=>e.appointmentId===appointment.id && e.date===date);
  const time=exception?.time || appointment.time;
  if(offset===0 && time<=clock.time)continue;
  return {...appointment,date,time,cancelled:exception?.status==='cancelled',reason:exception?.message || '',special:!!exception};
 }
 throw new Error('Não foi possível calcular a próxima ocorrência');
}
export function renderCalendar(schedule, now = new Date()) {
 return '<div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-calendar>'+schedule.appointments.filter(a=>a.active).map(a=>{
  const e=nextOccurrence(a,schedule.exceptions,now);const date=new Date(e.date+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC',weekday:'long',day:'2-digit',month:'2-digit'});
  return `<article class="bg-surface-container-lowest rounded-lg p-7 shadow-sm border border-outline-variant/30"><p class="font-semibold text-primary mb-3">${escapeHtml(date)}</p><h3 class="text-xl font-bold text-primary mb-3">${escapeHtml(e.title)}</h3><p class="mb-4 text-on-surface-variant">${escapeHtml(e.description)}</p><p class="font-semibold ${e.cancelled?'text-error':'text-primary'}">${e.cancelled?'Atendimento cancelado':`Início: ${escapeHtml(e.time)}`}</p>${e.reason?`<p class="mt-2">${escapeHtml(e.reason)}</p>`:''}${!e.cancelled?`<p class="mt-3">Fichas: ${escapeHtml(e.tickets)}</p><p>${escapeHtml(e.capacity)}</p>`:''}<p class="mt-4 text-sm">${escapeHtml(e.instructions)}</p><a href="/programacao/#orientacoes" class="inline-block mt-5 text-primary underline">Orientações para sua visita</a></article>`;
 }).join('')+'</div>';
}
export function activeNotices(notices, now = new Date()) {
 const {date}=localClock(now);
 return notices.items.filter(n=>n.active && (!n.start || n.start<=date) && (!n.end || n.end>=date));
}
export function renderNotices(notices,now=new Date()) {
 return activeNotices(notices,now).map(n=>`<aside class="rounded-lg p-5 mb-4 border border-outline-variant bg-secondary-container text-on-secondary-container"><h2 class="font-bold">${escapeHtml(n.title)}</h2><p>${escapeHtml(n.message)}</p></aside>`).join('');
}
