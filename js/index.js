function checkIsNullOrEmpty(value) {
    //正则表达式用于判斷字符串是否全部由空格或换行符组成
    var reg = /^\s*$/
    //返回值为true表示不是空字符串
    return (value != null && value != undefined && !reg.test(value))
}

$(function(){
    $("#rule").click(function(){
        var rule =  $(".rulediv");
        if(rule.is(':hidden')){
            rule.css('display','block');
        }
    });

    $(".closeImg").click(function(){

        $(this).parent().css('display','none');
    });

    $("#inverst").click(function(){
        var rule =  $(".Recommendation");
        if(rule.is(':hidden')){
            rule.css('display','block');
        }
    });

    $(".invest").click(function(){
        $(this).prev().css('display','none').text("");
        var invitors = $(".invitors").val();
        if(! checkIsNullOrEmpty(invitors)){
            console.log("推荐码码不能为空!");
            $(this).prev()
                .text("推荐码码不能为空!")
                .css('display','block');
            return null;
        }
        var inverstNum = $("#inverstNum").val();
        if(inverstNum<1 || inverstNum>29){
            console.log("投资数量范围是1-29!");
            $(this).prev()
                .text("投资数量范围是1-29!")
                .css('display','block')
            return ;
        }
        inverst();
    });


});



window.addEventListener('load', async() => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);

    }
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        // window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/71b7dcb12a69469aa61af1e049759342"));//正式地址
        window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/34dc58b3b7944a219797b3ce04a2fa7a"));
    }
    startApp();
});

// 合约地址
var heyue_addr;

function startApp(){
    console.log("startApp.......");
    heyue_addr = '0x484545267917f3C680277E87F1a391cDBC3f634d';

    Contract = new web3.eth.Contract(abi,heyue_addr);//合约

    web3.eth.getAccounts(function (err, accounts) {
        console.log("getAccounts accounts: "+accounts);
        if (accounts.length != 0) {
            $("#address").val(accounts[0]);
            $('#history').attr('href','https://etherscan.io/token/0x484545267917f3C680277E87F1a391cDBC3f634d?a='+accounts)
        }else{
            console.log("getAccounts accounts为空! ");
        }
    });



    /*Contract.methods.codeToAddress(168870).call()
        .then(function (data) {
            console.log("codeToAddress data: "+data);
            /!*if(isNaN(data)){
                console.log("totalInvestAmount data: "+data);
            }*!/

        });*/


    setTimeout(totalInvestAmount, 1000);
    setTimeout(globalNodeNumber, 1500);
    setTimeout(eth_amount, 2000);
    //setTimeout(getLevel, 3000);
    setTimeout(getUserByAddress, 4000);

    setTimeout(getTop10, 5000);
}

function totalInvestAmount() {
    // 邀请总额
    Contract.methods.totalInvestAmount().call()
        .then(function (data) {
            console.log("totalInvestAmount data: "+ data);
            var totalInvestAmount = 0;
            if(!isNaN(data)){
                totalInvestAmount = web3.utils.fromWei(data);
                $(".amount").text(totalInvestAmount+"ETH");

            }else{
                console.log("totalInvestAmount is null!");
            }

        });
}

function globalNodeNumber() {
    // 节点总数
    Contract.methods.globalNodeNumber().call()
        .then(function (data) {
            console.log("globalNodeNumber data: "+data);
            if(! isNaN(data)){
                data = web3.utils.hexToNumber(data);
                $(".box-top-left .list-bottom:eq(1)").text(data);
            }else{
                console.log("globalNodeNumber is null!");
            }
        });
}

function eth_amount() {
    var SELF_ADDR = $("#address").val();
    console.log("SELF_ADDR data: "+SELF_ADDR);
    web3.eth.getBalance(SELF_ADDR,function (error, result) {
        console.log("eth_amount data: "+result);
        if(!error) {
            if(isNaN(result)){
                eth_amount();
                return null;
            }
            var temp = web3.utils.fromWei(result, 'ether');
            temp = parseFloat(temp);
            $(".box-top-left .list-bottom:eq(5)").text(temp.toFixed(2)+' ETH');
            $("#amount").text("您的余额 "+temp+" 以太币");
            $('#amount').attr("href", "https://cn.etherscan.com/address/"+SELF_ADDR);
        }else {
            eth_sum();
            console.error(error);
        }
    })
}

function inverst(){
    var SELF_ADDR = $("#address").val();
    var invitors = $(".invitors").val();
    var inverstNum = $("#inverstNum").val();

    Contract.methods.invest(invitors).send({ from:SELF_ADDR , value: web3.utils.toWei(inverstNum) })
        .on("receipt", function(receipt) {
            console.log("invest data: "+ receipt)
            alert("投资成功!");
            location.reload();
        })
        .on("error", function(error) {
            alert('您取消了该操作或程序出现异常，请刷新重试!');
        });
}

function getLevel() {
    var SELF_ADDR = $("#address").val();
    // 获取用户级别
    Contract.methods.getLevel(SELF_ADDR).call()
        .then(function (data) {
            console.log("getLevel data: "+ data);
            var level = "";
            if(!isNaN(data)){
                //level = web3.utils.fromWei(data);
                switch (data) {
                    case ("1"):
                        level = "M 1";
                        break;
                    case ("2"):
                        level = "M 3";
                        break;
                    case ("3"):
                        level = "M 6";
                        break;
                    case ("4"):
                        level = "M 9";
                        break;
                    default:
                        level = "M 0";
                }
                $("#level").text(level);
            }else{
                console.log("getLevel is null!");
            }

        });
}


function getUserByAddress() {
    var SELF_ADDR = $("#address").val();
    // 获取用户信息
    Contract.methods.addressToUser(SELF_ADDR).call()
        .then(function (data) {
            console.log("getUserByAddress data: "+ data);
            console.log("getUserByAddress achieveTime: "+ data.achieveTime);//"0"
            console.log("getUserByAddress annualRing: "+ data.annualRing);//: "0"
            console.log("getUserByAddress birth: "+ data.birth);//: "1570787422"
            console.log("getUserByAddress investAmount: "+ data.investAmount);//: "2000000000000000000"
            console.log("getUserByAddress inviter: "+ data.inviter);//: "0x398F8Fa9189E01aF8D48D0a9590A829201949532"
            console.log("getUserByAddress invitersCount: "+ data.invitersCount);//: "0"
            console.log("getUserByAddress rebirth: "+ data.rebirth);//: "1570787422"
            console.log("getUserByAddress referCode: "+ data.referCode);//: "168871"
            console.log("getUserByAddress userAddress: "+ data.userAddress);//: "0x4C2E128D580A187cA8D5bf3B9feB8160d4FBdb0f"

            $(".box-top-left .list-bottom:eq(0)").text(data.referCode);
            $(".box-top-left .list-bottom:eq(2)").text(data.invitersCount);
            $(".box-top-left .list-bottom:eq(4)").text(web3.utils.fromWei(data.investAmount) +" ETH");


            var investAmount = parseFloat(web3.utils.fromWei(data.investAmount));
            var level = "";
            if(investAmount < 1){
                level = "M 0";
            }else if(investAmount < 6){
                level = "M 1";
            }else if(investAmount < 11){
                level = "M 3";
            }else if(investAmount < 16){
                level = "M 6";
            }else if(investAmount < 30){
                level = "M 9";
            }else{
                level = "M -1";
            }
            $(".box-top-left .list-bottom:eq(3)").text(level);


        });
}

function getTop10(){
    Contract.methods.getTop10().call()
        .then(function (data) {
            console.log("getTop10 data: "+data);

            var s = "";
            for(var i=0;i<data.length;i++){
                var address=data[i];
                if(address != "0x0000000000000000000000000000000000000000"){
                    s+="<li  class=\"box-ul-li\">"+address+"</li>";
                }
            }
            $(".rewardLIst-box").html(s);
        });
}