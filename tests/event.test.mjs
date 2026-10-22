import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventIsUpcoming,renderCommunityEvent} from '../src/lib/community-event.mjs';
const event={active:true,title:'Tarde do Pastel',description:'Encontro da comunidade',nextDate:'2026-11-09',startTime:null,endTime:null,price:null};
test('edição de novembro aparece até o fim do dia brasileiro',()=>{
 assert.equal(eventIsUpcoming(event,new Date('2026-11-10T02:59:00Z')),true);
 assert.equal(eventIsUpcoming(event,new Date('2026-11-10T03:00:00Z')),false);
});
test('edição passada deixa de ser anunciada como próxima',()=>{
 const output=renderCommunityEvent(event,new Date('2026-11-10T12:00:00Z'));
 assert.doesNotMatch(output,/<time/);assert.match(output,/próxima data será divulgada/);
});
test('dados de preço e horário não são inventados para a nova edição',()=>{
 const output=renderCommunityEvent(event,new Date('2026-10-22T12:00:00Z'));
 assert.match(output,/09 de novembro de 2026/);assert.doesNotMatch(output,/R\$|12h|18h/);
});
