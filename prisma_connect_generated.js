(async function(){
  try{
    const { PrismaClient } = require('./generated/prisma');
    const p = new PrismaClient();
    await p['$connect']();
    console.log('PRISMA CONNECT: OK');
    await p['$disconnect']();
  }catch(e){
    console.error('PRISMA CONNECT: ERROR', e && e.message ? e.message : e);
    // print stack for debugging but avoid printing env values
    console.error(e && e.stack ? e.stack.split('\n').slice(0,10).join('\n') : '');
    process.exitCode = 1;
  }
})();
