const { ethers } = require('ethers');
const moment = require("moment");

getSentTransactionsData = async (deployPhoneContract, owner) => 
{
    let filterpRE = deployPhoneContract.filters.prePaymentEve(null, owner, null, null, null, false, null);
    let prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.postPaymentEve(null, owner, null, null, null, false, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);

    let successfulTransactions = prePayments.filter(preLog =>
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
          postLog.args.transactionNo.toString() === preTransactionNo
        )
    }).map(preLog => 
    {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
      };
    });
    let failedTransactions = prePayments.filter(preLog => 
    {
      const preTransactionNo = preLog.args.transactionNo.toString();
      return !postPayments.some(postLog =>
        postLog.args.transactionNo.toString() === preTransactionNo
      )
    }).map(preLog => 
      {
        return {
          transactionNo: preLog.args.transactionNo.toString(),
          sender: preLog.args.sender,
          receiver: preLog.args.receiver,
          token: preLog.args.token,
          amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
          date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
        };
      });


    filterpRE = deployPhoneContract.filters.prePaymentEve(null, owner, null, null, null, true, null);
    prePayments = await deployPhoneContract.queryFilter(filterpRE);

    let crossChainSendTransactions = prePayments.map(preLog => {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
      };
    });
    
    successfulTransactions = [...successfulTransactions, ...crossChainSendTransactions];
    return [successfulTransactions, failedTransactions];
}

getReceiveTransactionsData = async (deployPhoneContract, account1) => 
{
    let filterpRE = deployPhoneContract.filters.prePaymentEve(null, null, account1, null, null, false, null);
    let prePayments = await deployPhoneContract.queryFilter(filterpRE);

    let filterpOST = deployPhoneContract.filters.postPaymentEve(null, null, account1, null, null, false, null);
    let postPayments = await deployPhoneContract.queryFilter(filterpOST);

    let successfulTransactions = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    }).map(preLog => 
      {
        return {
          transactionNo: preLog.args.transactionNo.toString(),
          sender: preLog.args.sender,
          receiver: preLog.args.receiver,
          token: preLog.args.token,
          amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
          date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
        };
      });

    let failedTransactions = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
          postLog.args.transactionNo.toString() === preTransactionNo
        );
    }).map(preLog => 
      {
        return {
          transactionNo: preLog.args.transactionNo.toString(),
          sender: preLog.args.sender,
          receiver: preLog.args.receiver,
          token: preLog.args.token,
          amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
          date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
        };
      });

    filterpost = deployPhoneContract.filters.postPaymentEve(null, null, account1, null, null, true, null);
    prePayments = await deployPhoneContract.queryFilter(filterpost);

    let crossChainReceiveTransactions = prePayments.map(preLog => {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment.unix(preLog.args.date.toString()).format("YYYY-MM-DD HH:mm:ss")
      };
    });
    
    successfulTransactions = [...successfulTransactions, ...crossChainReceiveTransactions];
    return [successfulTransactions, failedTransactions];
}

getTransactionsdata = async (deployPhoneContract, address) => 
{
  const sentTransactions = await getSentTransactionsData(deployPhoneContract, address);
  const receivedTransactions = await getReceiveTransactionsData(deployPhoneContract, address);
  let response = {};
  response["sentTransactions"] = sentTransactions[0];
  response["receivedTransactions"] = receivedTransactions[0];
  return response;
}

module.exports = getTransactionsdata;