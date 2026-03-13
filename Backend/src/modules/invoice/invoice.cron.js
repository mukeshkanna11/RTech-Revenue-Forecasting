const cron = require("node-cron");
const Invoice = require("./invoice.model");

cron.schedule("0 0 * * *", async () => {

  const today = new Date();

  await Invoice.updateMany(
    {
      dueDate: { $lt: today },
      status: { $ne: "paid" }
    },
    {
      status: "overdue"
    }
  );

  console.log("Invoice overdue status updated");

});