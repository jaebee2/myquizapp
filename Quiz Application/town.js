// ==UserScript==
// @name         Town Star Auto-Sell
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://townstar.sandbox-games.com/launch/
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const sellTimer = 600; // Seconds between selling
    const depotType = 'Trade_Depot'; // Valid Options: 'Trade_Pier', 'Freight_Pier', 'Express_Depot'
    const craftedItem1 = 'Wheat';
    let sellingActive = 0;

    new MutationObserver(function(mutations){
        let airdropcollected = 0;
        if(document.getElementsByClassName('hud-jimmy-button')[0] && document.getElementsByClassName('hud-jimmy-button')[0].style.display != 'none'){
            document.getElementsByClassName('hud-jimmy-button')[0].click();
            document.getElementById('Deliver-Request').getElementsByClassName('yes')[0].click();
        }
        if(document.getElementsByClassName('hud-airdrop-button')[0] && document.getElementsByClassName('hud-airdrop-button')[0].style.display != 'none'){
            if(airdropcollected == 0){
                airdropcollected = 1;
                document.getElementsByClassName('hud-airdrop-button')[0].click();
                document.getElementsByClassName('air-drop')[0].getElementsByClassName('yes')[0].click();
            }
        }
        if (document.getElementById("playnow-container") && document.getElementById("playnow-container").style.visibility !== "hidden") {
            document.getElementById("playButton").click();
        }
        if(typeof Game != 'undefined' && Game.town != null) {
            if(sellingActive == 0) {
              console.log('Game loaded');
              sellingActive = 1;
              activateSelling();
            }
        }
    }).observe(document, {attributes: true, childList: true , subtree: true});

    function activateSelling() {
        let start = GM_getValue("start", Date.now());
        GM_setValue("start", start);
        setTimeout(function(){
            let tempSpawnCon = Trade.prototype.SpawnConnection;
            Trade.prototype.SpawnConnection = function(r) {tempSpawnCon.call(this, r); console.log(r.craftType); GM_setValue(Math.round((Date.now() - start)/1000).toString(), r.craftType);}
        },10000);
        let depotObj = Object.values(Game.town.objectDict).find(o => o.type.toLowerCase() === depotType.toLowerCase());
        let depotKey = "[" + depotObj.townX + ", " + "0, " + depotObj.townZ + "]";
        window.mySellTimer = setInterval(function(){
            Game.town.objectDict[depotKey].logicObject.OnTapped();
            console.log("current Flour count: " + Game.town.GetStoredCrafts()[craftedItem1]);
            if (Game.town.GetStoredCrafts()["Gasoline"] > 0) {
                if (Game.town.GetStoredCrafts()[craftedItem1] > 9) {
                    console.log("SELLING " + craftedItem1 + "!");
                    Game.app.fire("SellClicked", {x: depotObj.townX, z: depotObj.townZ});
                    setTimeout(function(){
                        let craftTarget = document.getElementById("trade-craft-target");
                        craftTarget.querySelectorAll('[data-name="' + craftedItem1 + '"]')[0].click();
                        setTimeout(function(){
                            document.getElementById("destination-target").getElementsByClassName("destination")[0].getElementsByClassName("sell-button")[0].click();
                        },1000);
                    },5000);
                }
            }
        },sellTimer*1000);
    }
})();