// ==UserScript==
// @name         Fragment Fix
// @version      1.0
// @description  Too many Usernames? No problem!
// @author       @purr
// @match        https://fragment.com/my/assets
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function getWalletAddress() {
    const walletElement = document.querySelector(".tm-wallet");
    const head = walletElement.querySelector(".head");
    const tail = walletElement.querySelector(".tail");
    if (head && tail) {
      return head.textContent + tail.textContent;
    }
    const short = walletElement.querySelector(".short");
    if (short) {
      return short.textContent;
    }
    return null;
  }

  function injectNFTsIntoTable(walletAddress) {
    const url = `https://tonapi.io/v2/accounts/${walletAddress}/nfts?collection=0%3A80d78a35f955a14b679faa887ff4cd5bfc0f43b4a4eea2a7e6927f3701b273c2&limit=1000&offset=0&indirect_ownership=false`;
    console.log("ATTEMPTING TO FETCH");
    fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("FETCHED");
        const nftItems = data.nft_items;
        const usernames = Array.from(
          new Set(
            nftItems.map((item) => {
              const dns = item.dns;
              return dns.split(".")[0];
            })
          )
        ).sort((a, b) => a.localeCompare(b));

        console.log(usernames);
        const table = document.querySelector(
          ".table.tm-table.tm-table-fixed .tm-high-cells"
        );
        if (table) {
          usernames.forEach((username) => {
            if (!table.innerHTML.includes(username)) {
              const newRow = document.createElement("tr");
              newRow.classList.add("tm-row-selectable");
              newRow.innerHTML = `
                        <td>
                          <a href="/username/${username}" class="table-cell">
                            <div class="table-cell-value tm-value">@${username}</div>
                            <div class="table-cell-desc tm-nowrap"><span class="accent-color"><span class="tm-web3-address"><span class="subdomain">${username}</span><span class="domain">.t.me</span></span></span></div>
                          </a>
                        </td>
                        <td class="thin-last-col wide-last-col">
                          <a href="/username/${username}" class="table-cell">
                              <div class="tm-table-actions js-actions" data-username="${username}" data-item-title="@${username}" data-def-bid="104" data-need-check="1" data-assigned-to="">
                            <button class="btn btn-primary tm-table-action tm-table-button js-assign-btn table-selectable-in-row">
                          Assign to Telegram
                        </button>
                            <span class="tm-table-action tm-table-action-link wide-only js-put-to-auction-btn table-selectable-in-row">
                          Put up for auction
                        </span>
                        <span class="tm-table-action tm-table-action-link wide-only js-sell-username-btn table-selectable-in-row">
                          Sell username
                        </span>
                        <div class="btn-group tm-dropdown tm-table-action thin-only">
                          <button class="btn btn-default tm-table-button dropdown-toggle icon-before icon-actions table-selectable-in-row" data-toggle="dropdown"></button>
                          <ul class="dropdown-menu">
                              <li><span class="dropdown-menu-item js-sell-username-btn">Sell username</span></li>
                              <li><span class="dropdown-menu-item js-put-to-auction-btn">Put up for auction</span></li>
                          </ul>
                        </div>
                        </div>
                          </a>
                        </td>
                    `;

              table.appendChild(newRow);
            }
          });
        }
      })
      .catch((error) => console.error("error fetching nfts", error));
  }
  let hasRun = false;
  let lastUrl = window.location.href;

  function checkUrl() {
    const currentUrl = window.location.href;

    if (currentUrl === "https://fragment.com/my/assets" && !hasRun) {
      console.log("URL matched");

      const walletAddress = getWalletAddress();
      console.log("Trying to get wallet");

      if (walletAddress) {
        injectNFTsIntoTable(walletAddress);
        hasRun = true;
      } else {
        console.log("No wallet address found.");
      }

      console.log("Script done");
    }

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      hasRun = false;
    }
  }

  const observer = new MutationObserver(() => {
    checkUrl();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  checkUrl();
})();
