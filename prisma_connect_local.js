(async function(){
  try{
    const {PrismaClient} = require('./node_modules/@prisma/client');
    const p = new PrismaClient();
    await p['']();
    console.log('PRISMA CONNECT: OK');
    await p['']();
  }catch(e){
    console.error('PRISMA CONNECT: ERROR', e && e.message ? e.message : e);
    process.exitCode = 1;
  }
})();
