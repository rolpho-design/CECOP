import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextOccurrence,activeNotices,renderCalendar} from '../src/lib/calendar.mjs';
const appointment={id:'quinta',title:'Atendimento',weekday:4,time:'16:30',tickets:'15h45',capacity:'450',description:'Descrição',instructions:'Orientações',active:true};
test('horário brasileiro: quinta ainda não ocorreu às 16h29 locais',()=>{
 assert.equal(nextOccurrence(appointment,[],new Date('2026-10-22T19:29:00Z')).date,'2026-10-22');
 assert.equal(nextOccurrence(appointment,[],new Date('2026-10-22T19:31:00Z')).date,'2026-10-29');
});
test('cancelamento afeta a ocorrência certa e não a semana seguinte',()=>{
 const exceptions=[{appointmentId:'quinta',date:'2026-10-22',status:'cancelled',message:'Feriado'}];
 assert.equal(nextOccurrence(appointment,exceptions,new Date('2026-10-22T12:00Z')).cancelled,true);
 assert.equal(nextOccurrence(appointment,exceptions,new Date('2026-10-23T12:00Z')).cancelled,false);
 const rendered=renderCalendar({appointments:[appointment],exceptions},new Date('2026-10-22T12:00Z'));
 assert.match(rendered,/Atendimento cancelado/);assert.doesNotMatch(rendered,/Início: 16:30/);
});
test('horário especial posterior mantém o atendimento de hoje disponível',()=>{
 const e=nextOccurrence(appointment,[{appointmentId:'quinta',date:'2026-10-22',status:'special',time:'20:00',message:'Horário especial'}],new Date('2026-10-22T22:00Z'));
 assert.equal(e.date,'2026-10-22');assert.equal(e.time,'20:00');
});
test('aviso respeita início/fim inclusive e troca de dia no Brasil',()=>{
 const notices={items:[{title:'Aviso',message:'Texto',active:true,start:'2026-10-22',end:'2026-10-22'}]};
 assert.equal(activeNotices(notices,new Date('2026-10-22T02:59Z')).length,0);
 assert.equal(activeNotices(notices,new Date('2026-10-23T02:59Z')).length,1);
 assert.equal(activeNotices(notices,new Date('2026-10-23T03:00Z')).length,0);
});
test('conteúdo editorial não é executado como HTML',()=>{
 const out=renderCalendar({appointments:[{...appointment,title:'<script>alert(1)</script>'}],exceptions:[]},new Date('2026-10-22T12:00Z'));
 assert.doesNotMatch(out,/<script>/);assert.match(out,/&lt;script&gt;/);
});

test('card da Home preserva a caixa de horários e destaca cancelamento por data',async()=>{
 const {readFileSync}=await import('node:fs');
 const {renderHomeCard}=await import('../src/lib/calendar.mjs');
 const template=readFileSync(new URL('../src/templates/home-card-quinta.html',import.meta.url),'utf8');
 const normal=renderHomeCard(template,appointment,[],new Date('2026-10-22T12:00Z'));
 assert.match(normal,/16h30/);assert.doesNotMatch(normal,/data-timebox hidden/);assert.doesNotMatch(normal,/\[\[/);
 const cancelled=renderHomeCard(template,appointment,[{appointmentId:'quinta',date:'2026-10-22',status:'cancelled',message:'Sem atendimento'}],new Date('2026-10-22T12:00Z'));
 assert.match(cancelled,/Atendimento cancelado/);assert.match(cancelled,/data-timebox hidden/);
});
