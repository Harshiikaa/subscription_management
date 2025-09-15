const Agenda = require("agenda");

let agendaInstance = null;

async function initAgenda(mongoUri) {
  if (agendaInstance) return agendaInstance;

  agendaInstance = new Agenda({
    db: { address: mongoUri, collection: "agendaJobs" },
    processEvery: "30 seconds",
    maxConcurrency: 20,
    defaultConcurrency: 5,
  });

  await agendaInstance.start();
  return agendaInstance;
}

function getAgenda() {
  if (!agendaInstance) throw new Error("Agenda is not initialized yet");
  return agendaInstance;
}

module.exports = { initAgenda, getAgenda };
