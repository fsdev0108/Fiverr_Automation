// ---------------------------
// CONFIG
// ---------------------------

const DEFAULT_BACKEND_BASE = "https://rabbit-fiverr.duckdns.org";
const ALARM_NAME = "SendingCycle";
const ALARM_PERIOD = 10; //10min

let workerTabId = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBackendBase() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["backendBase"], (res) => {
      resolve(res.backendBase || DEFAULT_BACKEND_BASE);
    });
  });
}

async function getRunning() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isRunning"], (res) => {
      resolve(Boolean(res.isRunning));
    });
  });
}

async function setRunning(v) {
  await chrome.storage.local.set({ isRunning: v });
}

// async function openOrReuseTab(url) {
//   let { workerTabId } = await chrome.storage.local.get("workerTabId");
//   // if (!await getRunning()) return;
//   if (workerTabId !== null) {
//     try {
//       const tab = await chrome.tabs.update(workerTabId, { url, active: false });
//       workerTabId = tab.id;
//       return workerTabId;
//     } catch (e) {
//       workerTabId = null;
//     }
//   }
//   const tab = await chrome.tabs.create({ url, active: false });
//   chrome.storage.local.set({ workerTabId: tab.id });
//   return tab.id;
// }

async function openOrReuseTab(url) {
  let { workerTabId } = await chrome.storage.local.get("workerTabId");

  try {
    if (workerTabId) {
      await chrome.tabs.get(workerTabId);
      return (await chrome.tabs.update(workerTabId, { url, active: false })).id;
    }
  } catch {}

  const tab = await chrome.tabs.create({ url, active: false });
  chrome.storage.local.set({ workerTabId: tab.id });
  return tab.id;
}

function waitForTabLoaded(tabId, timeoutMS = 30000) {
  return new Promise((resolve) => {
    function listener(id, info) {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}


function getRandomDelay(a, b) {
  const min = a / 1;
  const max = b / 1;

  if (Number.isNaN(min) || Number.isNaN(max)) {
    setRunning(false);
    return 1000;
  }

  return Math.floor(
    (Math.random() * (max - min) + min)
  );
}

async function input_data1( tabId )
{
   const [{ result }] = await chrome.scripting.executeScript(
   {
      target: { tabId },
      func: async () => 
      {
         const Sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
         await Sleep( 5000 );

         const editor = document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
            document.querySelector('#send-message-text-area [data-track-tag="rich_text_editor"] [contenteditable="true"][data-slate-editor="true"]') ||
            document.querySelector('#send-message-text-area [contenteditable="true"]') ||
            document.querySelector("textarea") ||
            document.querySelector('[data-slate-editor="true"]');
         const sendBtn = document.querySelector('button[aria-label="Send"]') ||
            [...document.querySelectorAll('button')]
               .find(btn => btn.getAttribute("aria-label")?.toLowerCase().includes("send"));
         const nameEl = document.querySelector("a._1t7mz2xk._1t7mz2xl._1t7mz2xr.ce05uz26s.ce05uz26t.ce05uz8.ce05uz2.ce05uz292.ce05uz29e.ce05uz29i")

         if ( !editor || !sendBtn ) 
         {
            return { state: "Error", message: "UI elements missing" };
         }

         const firstName = ( nameEl?.textContent?.trim() || "there" ).split( " " )[ 0 ];
         const messageText = `Hello ${firstName}! 👋
Nice to meet you. How are you?
I'm looking for a US-based freelancer to help me with a project.`;

         // Simulate human-like mouse movement and click
         const targetRect = editor.getBoundingClientRect();
         const x = targetRect.left + ( targetRect.width / 2 );
         const y = targetRect.top + ( targetRect.height / 2 );

        //  editor.dispatchEvent( new MouseEvent( "mousemove", { clientX: x, clientY: y, bubbles: true } ) );
        //  editor.dispatchEvent( new MouseEvent( "mousedown", { clientX: x, clientY: y, bubbles: true } ) );
        //  editor.focus();
        //  editor.dispatchEvent( new MouseEvent( "mouseup", { clientX: x, clientY: y, bubbles: true } ) );
        //  editor.dispatchEvent( new MouseEvent( "click", { clientX: x, clientY: y, bubbles: true } ) );

        //  editor.textContent = "";
        const mouseEvents = [ 'mousemove', 'mousedown', 'mouseup', 'click' ];
         mouseEvents.forEach( type => 
         {
            editor.dispatchEvent( new MouseEvent( type, { clientX: x, clientY: y, bubbles: true } ) );
         } );

         editor.focus();
         editor.textContent = "";

         // Process typed text character by character
         for ( const char of messageText ) 
         {
          console.log(char, "--?");
          
            const keyEventInit = { key: char, bubbles: true };
            editor.dispatchEvent( new KeyboardEvent( "keydown", keyEventInit ) );
            // editor.dispatchEvent( new KeyboardEvent( "keypress", keyEventInit ) );
            
            // Slate/React often requires manual text insertion during emulation
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents( editor );
            range.collapse( false );
            const textNode = document.createTextNode( char );
            range.insertNode( textNode );
            
            editor.dispatchEvent( new InputEvent( "input", { inputType: "insertText", data: char, bubbles: true } ) );
            editor.dispatchEvent( new KeyboardEvent( "keyup", keyEventInit ) );
            
            // Random delay between 20ms and 70ms to mimic typing speed
            await Sleep( Math.random() * 100 + 20 );
         }

         await Sleep( 1000 );
         sendBtn.click();

         return { state: "Success", message: "Message sent character by character" };
      }
   } );

   if ( result.state === "Error" ) 
   {
      await setRunning( false );
   }
}

async function input_data2( tabId )
{
   const [{ result }] = await chrome.scripting.executeScript(
   {
      target: { tabId },
      func: async () => 
      {
        async function sendmessage(messageText) {
          const Sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
          await Sleep( 5000 );
                const editor = document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [data-track-tag="rich_text_editor"] [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [contenteditable="true"]') ||
                  document.querySelector("textarea") ||
                  document.querySelector('[data-slate-editor="true"]');
                const sendBtn = document.querySelector('button[aria-label="Send"]') ||
                  [...document.querySelectorAll('button')]
                      .find(btn => btn.getAttribute("aria-label")?.toLowerCase().includes("send"));
        
                if ( !editor || !sendBtn ) 
                {
                  return { state: "Error", message: "UI elements missing" };
                }
                // Simulate human-like mouse movement and click
                const targetRect = editor.getBoundingClientRect();
                const x = targetRect.left + ( targetRect.width / 2 );
                const y = targetRect.top + ( targetRect.height / 2 );
                
                const mouseEvents = [ 'mousemove', 'mousedown', 'mouseup', 'click' ];
                mouseEvents.forEach( type => 
                {
                    editor.dispatchEvent( new MouseEvent( type, { clientX: x, clientY: y, bubbles: true } ) );
                } );

                editor.focus();
                editor.textContent = "";

                // Process typed text character by character
                for ( const char of messageText ) 
                {
                  
                    const keyEventInit = { key: char, bubbles: true };
                    editor.dispatchEvent( new KeyboardEvent( "keydown", keyEventInit ) );
                    // editor.dispatchEvent( new KeyboardEvent( "keypress", keyEventInit ) );
                    
                    // Slate/React often requires manual text insertion during emulation
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents( editor );
                    range.collapse( false );
                    const textNode = document.createTextNode( char );
                    range.insertNode( textNode );
                    
                    editor.dispatchEvent( new InputEvent( "input", { inputType: "insertText", data: char, bubbles: true } ) );
                    editor.dispatchEvent( new KeyboardEvent( "keyup", keyEventInit ) );
                    
                    // Random delay between 20ms and 70ms to mimic typing speed
                    await Sleep( Math.random() * 100 + 50 );
                }

                await Sleep( 1000 );
                sendBtn.click();
        }
         const messageText1 = `Thanks for reaching out. I've a good business with you to efficiently plan a project together.`;
         await sendmessage(messageText1)  
         return { state: "Success" }; 

      }
   } );
   console.log("Result from injected script:", result); // Log the result from the content script
  if (result.state == "Error") {
    await setRunning(false);
    console.log("Error occured! send2_2");
  }
}

async function input_data3( tabId )
{
   const [{ result }] = await chrome.scripting.executeScript(
   {
      target: { tabId },
      func: async () => 
      {
          const Sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
          await Sleep( 5000 );
                const editor = document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [data-track-tag="rich_text_editor"] [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [contenteditable="true"]') ||
                  document.querySelector("textarea") ||
                  document.querySelector('[data-slate-editor="true"]');
                const sendBtn = document.querySelector('button[aria-label="Send"]') ||
                  [...document.querySelectorAll('button')]
                      .find(btn => btn.getAttribute("aria-label")?.toLowerCase().includes("send"));
        
                      if ( !editor || !sendBtn ) 
                        {
                          return { state: "Error", message: "UI elements missing" };
                        }
                        const messageText = `I've a good business with you to efficiently plan a project together.`;
                  // Simulate human-like mouse movement and click
                  const targetRect = editor.getBoundingClientRect();
                  const x = targetRect.left + ( targetRect.width / 2 );
                  const y = targetRect.top + ( targetRect.height / 2 );
                  
                  const mouseEvents = [ 'mousemove', 'mousedown', 'mouseup', 'click' ];
                  mouseEvents.forEach( type => 
                    {
                      editor.dispatchEvent( new MouseEvent( type, { clientX: x, clientY: y, bubbles: true } ) );
                } );
                console.log("Ok");
                
                editor.focus();
                editor.textContent = "";

                // Process typed text character by character
                for ( const char of messageText ) 
                {
                  
                    const keyEventInit = { key: char, bubbles: true };
                    editor.dispatchEvent( new KeyboardEvent( "keydown", keyEventInit ) );
                    // editor.dispatchEvent( new KeyboardEvent( "keypress", keyEventInit ) );
                    
                    // Slate/React often requires manual text insertion during emulation
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents( editor );
                    range.collapse( false );
                    const textNode = document.createTextNode( char );
                    range.insertNode( textNode );
                    
                    editor.dispatchEvent( new InputEvent( "input", { inputType: "insertText", data: char, bubbles: true } ) );
                    editor.dispatchEvent( new KeyboardEvent( "keyup", keyEventInit ) );
                    
                    // Random delay between 20ms and 70ms to mimic typing speed
                    await Sleep( Math.random() * 100 + 50 );
                }

                await Sleep( 1000 );
                sendBtn.click();
        
        return { state: "Success" }; 

        }
    } );
    console.log("Result from injected script:", result); // Log the result from the content script
    if (result.state == "Error") {
      await setRunning(false);
      console.log("Error occured! send2_2");
    }
}

async function sendMessage(tabId, messageText) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    args: [messageText],
    func: async (messageText) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

      async function waitFor(fn, timeout = 1500, interval = 200) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const value = fn();
          if (value) return value;
          await sleep(interval);
        }
        throw new Error("Timeout waiting for UI");
      }

      const editor = await waitFor(() =>
        document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
        document.querySelector('#send-message-text-area [data-track-tag="rich_text_editor"] [contenteditable="true"][data-slate-editor="true"]') ||
        document.querySelector('#send-message-text-area [contenteditable="true"]') ||
        document.querySelector("textarea") ||
        document.querySelector('[data-slate-editor="true"]')
      );

      let sendBtn = await waitFor(() =>
        [...document.querySelectorAll('button')].find(btn => {
          const label = (btn.getAttribute("aria-label") || "").toLowerCase();
          return label.includes("send") && !btn.disabled;
        })
      );

      editor.scrollIntoView({ block: "center" });
      editor.click();
      editor.focus();

      // Clear existing content in a way the page is more likely to notice
      if (editor.tagName === "TEXTAREA" || editor.tagName === "INPUT") {
        const proto = editor.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const valueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        valueSetter?.call(editor, "");
        editor.dispatchEvent(new InputEvent("input", {
          bubbles: true,
          inputType: "deleteContentBackward",
          data: null
        }));
      } else {
        editor.textContent = "";
        editor.dispatchEvent(new InputEvent("input", {
          bubbles: true,
          inputType: "deleteContentBackward",
          data: null
        }));
      }

      // Type like a user
      for (const char of messageText) {
        editor.focus();

        const keyEventInit = { key: char, bubbles: true };
        editor.dispatchEvent(new KeyboardEvent("keydown", keyEventInit));

        if (document.execCommand) {
          document.execCommand("insertText", false, char);
        } else {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editor);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
          range.insertNode(document.createTextNode(char));
        }

        editor.dispatchEvent(new InputEvent("input", {
          bubbles: true,
          inputType: "insertText",
          data: char
        }));

        editor.dispatchEvent(new KeyboardEvent("keyup", keyEventInit));
        await sleep(50 + Math.random() * 80);
      }

      await sleep(500);

      // Re-query button right before click in case the UI re-rendered
      sendBtn = [...document.querySelectorAll('button')].find(btn => {
        const label = (btn.getAttribute("aria-label") || "").toLowerCase();
        return label.includes("send") && !btn.disabled;
      });

      if (!sendBtn) {
        return { state: "Error", message: "Send button not ready" };
      }

      sendBtn.click();
      return { state: "Success" };
    }
  });

  console.log("Result:", result);
  return result;
}


async function uploadAttachment(tabId, fileUrl, fileName) {

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [fileUrl, fileName],
        func: async (fileUrl, fileName) => {

            try {

                const input = document.querySelector(
                    'input[type="file"][name="attachments"]'
                );

                if (!input) {
                    return {
                        success: false,
                        error: "File input not found"
                    };
                }


                // Load file
                const response = await fetch(fileUrl);
                const blob = await response.blob();


                const file = new File(
                    [blob],
                    fileName,
                    {
                        type: blob.type
                    }
                );


                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);


                // Set file
                input.files = dataTransfer.files;


                // Trigger React events
                input.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );


                return {
                    success: true,
                    name: file.name,
                    size: file.size
                };


            } catch(e) {

                return {
                    success:false,
                    error:e.message
                };

            }

        }
    });


    console.log("Upload result:", result);

    return result;
}



async function input_data4(tabId, messageText, fileUrl, fileName) {


    // 1. Upload attachment
    const upload = await uploadAttachment(
        tabId,
        fileUrl,
        fileName
    );


    if (!upload.success) {
        console.log("Attachment failed:", upload.error);
        return;
    }


    console.log(
        "Uploaded:",
        upload.name,
        upload.size
    );


    // 2. Wait Fiverr upload to S3 complete
    await sleep(5000);



    // 3. Send message
    const [{ result }] = await chrome.scripting.executeScript(
   {
      target: { tabId },
      func: async () => 
      {
        async function sendmessage(messageText) {
          const Sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
          await Sleep( 5000 );
         console.log("222");
                const editor = document.querySelector('#send-message-text-area [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [data-track-tag="rich_text_editor"] [contenteditable="true"][data-slate-editor="true"]') ||
                  document.querySelector('#send-message-text-area [contenteditable="true"]') ||
                  document.querySelector("textarea") ||
                  document.querySelector('[data-slate-editor="true"]');
                const sendBtn = document.querySelector('button[aria-label="Send"]') ||
                  [...document.querySelectorAll('button')]
                      .find(btn => btn.getAttribute("aria-label")?.toLowerCase().includes("send"));
        
                if ( !editor || !sendBtn ) 
                {
                  return { state: "Error", message: "UI elements missing" };
                }
                // Simulate human-like mouse movement and click
                const targetRect = editor.getBoundingClientRect();
                const x = targetRect.left + ( targetRect.width / 2 );
                const y = targetRect.top + ( targetRect.height / 2 );

                const mouseEvents = [ 'mousemove', 'mousedown', 'mouseup', 'click' ];
                mouseEvents.forEach( type => 
                {
                    editor.dispatchEvent( new MouseEvent( type, { clientX: x, clientY: y, bubbles: true } ) );
                } );

                editor.focus();
                editor.textContent = "";

                // Process typed text character by character
                for ( const char of messageText ) 
                {
                  
                    const keyEventInit = { key: char, bubbles: true };
                    editor.dispatchEvent( new KeyboardEvent( "keydown", keyEventInit ) );
                    // editor.dispatchEvent( new KeyboardEvent( "keypress", keyEventInit ) );
                    
                    // Slate/React often requires manual text insertion during emulation
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents( editor );
                    range.collapse( false );
                    const textNode = document.createTextNode( char );
                    range.insertNode( textNode );
                    
                    editor.dispatchEvent( new InputEvent( "input", { inputType: "insertText", data: char, bubbles: true } ) );
                    editor.dispatchEvent( new KeyboardEvent( "keyup", keyEventInit ) );
                    
                    // Random delay between 20ms and 70ms to mimic typing speed
                    await Sleep( Math.random() * 100 + 50 );
                }

                await Sleep( 1000 );
                sendBtn.click();
        }
         const messageText1 = `Here is my proposal.`;
         await sendmessage(messageText1)  
         return { state: "Success" }; 

      }
   } );
   console.log("Result from injected script:", result); // Log the result from the content script
  if (result.state == "Error") {
    await setRunning(false);
    console.log("Error occured! send2_2");
  }
}
async function getStage(username) {
    const data = await chrome.storage.local.get(username);
    return data[username] || 0;
}

async function setStage(username, stage) {
    await chrome.storage.local.set({
        [username]: stage
    });
}

async function processUnreadContacts(tabId) {
  const [{ result: contacts }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () =>
          [...document.querySelectorAll(".contact")]
              .filter(contact => contact.querySelector("div.ce05uz79 p"))
              .map((contact, index) => ({
                  index,
                  username: contact.querySelector("p[data-track-tag='text']")?.textContent.trim(),
              }))
  });
  console.log(contacts);
  const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
              const messages = document.querySelectorAll(
                  '._1t7mz2xk.ce05uz1go.ce05uz1e6.ce05uz8.ce05uz2'
              );
              const contents = document.querySelectorAll(`._1t7mz2xk.ax65pu1e.ce05uz1go.ce05uz1e6.ce05uz2.ce05uzd.ce05uz2j.ce05uzo2.ce05uzkl.ce05uzhk`);
              const blockmessage = document.querySelectorAll(`._1t7mz2xk.ce05uz1gt.ce05uz1eb.ce05uz8.ce05uz2`)
              let count = 0;
              console.log(blockmessage.length===2);
              
              let block = blockmessage.length === 2;
              let msg = false;
              let username = ""           
              let length = 0;  
              for (const el of messages) {
                  if (el.textContent.trim() === "United States") break;
                  length++;
                  if (el.textContent.trim() === "Me") {
                      count++;
                      msg = false;
                  } else {
                    msg = true;
                    username = el.textContent.trim()
                  }
              }
              console.log(count);
              
              let startsWithN = false;
              if (count > 0) {
                  const lastMessage = contents[length - 1].textContent.trim();                  
                  startsWithN = lastMessage.charAt(0).toLowerCase() === "n";
              }
               return {
                  count,
                  valid: !startsWithN,
                  block,
                  msg,
                  username
              };
          }
      });
      console.log("executeScript result:", result);

      if (!result) {
          console.log("No result returned from injected script");
          return;
      }
      console.log(result.block, result.count, result.valid);
      if(!result.valid || result.count>3 || result.block){
        await setStage(result.username, 3);
        await sleep(3000)
      }else if(result.msg){
        switch (result.count) {
          case 1:
            await input_data2(tabId);
            await setStage(result.username, 1);
            break;
            case 2:
              await input_data4(
                tabId,
                "Here is my proposal.",
                chrome.runtime.getURL("files/Requirement.png"),
                "Requirement.png"
              );
            await setStage(result.username, 2);
            break;
            }
          }
      for (const contact of contacts) {
              console.log("username ->", contact);
              
              const stage = await getStage(contact.username);
              console.log(stage);
              
              if (stage >= 2)
                continue;
              
              
              // click this contact
              await chrome.scripting.executeScript({
        target: { tabId },
        args: [contact.username],
        func: async (username) => {
          const sleep = ms => new Promise(r => setTimeout(r, ms));

          const contact = [...document.querySelectorAll(".contact")].find(c =>
            c.querySelector("p[data-track-tag='text']")?.textContent.trim() === username
          );
          
          if (!contact) return;
          
          const rect = contact.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          for (const type of ["mousemove", "mousedown", "mouseup", "click"]) {
            contact.dispatchEvent(new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: x,
              clientY: y
            }));
            await sleep(20);
          }
        }
      });
      await sleep(5000);
      const [{ result}] = await chrome.scripting.executeScript({
          target: { tabId },
          args: [contact.username],
          func: (username) => {
              const messages = document.querySelectorAll(
                  '._1t7mz2xk.ce05uz1go.ce05uz1e6.ce05uz8.ce05uz2'
              );
              const blockmessage = document.querySelectorAll(`._1t7mz2xk.ce05uz1gt.ce05uz1eb.ce05uz8.ce05uz2`)
              const contents = document.querySelectorAll(`._1t7mz2xk.ax65pu1e.ce05uz1go.ce05uz1e6.ce05uz2.ce05uzd.ce05uz2j.ce05uzo2.ce05uzkl.ce05uzhk`);
              
              let count = 0;
              let length = 0;
              let block = blockmessage.length === 2;
              
             let msg = false;
              for (const el of messages) {
                  if (el.textContent.trim() === "United States") break;
                  length++;
                  if (el.textContent.trim() === "Me") {
                      count++;
                      msg = false;
                  } else {
                    msg = true;
                  }
              }
              console.log(count);
              
              let startsWithN = false;
              if (count > 0) {
                  const lastMessage = contents[length - 1].textContent.trim();                  
                  startsWithN = lastMessage.charAt(0).toLowerCase() === "n";
              }
               return {
                  count,
                  valid: !startsWithN,
                  block,
                  msg,
              };
          }
      });
      console.log("executeScript result:", result);

      if (!result) {
          console.log("No result returned from injected script");
          return;
      }
      if(!result.valid || result.count>3 || result.block){
        await setStage(contact.username, 3);
        await sleep(3000)
        continue;
      }
      // await waitUntilConversationLoaded(tabId);
    else if(result.msg){
        switch (result.count) {
          case 1:
            await input_data2(tabId);
            await setStage(result.username, 1);
            break;
            case 2:
              await input_data4(
                tabId,
                "Here is my proposal.",
                chrome.runtime.getURL("files/Requirement.png"),
                "Requirement.png"
              );
            await setStage(result.username, 2);
            break;
            }
          }
    await sleep(3000)
  }
}

async function sendToUser(data) {
  console.log(data);
  let delay;
  // Open the Fiverr tab
  let tabId;
  let { workerTabId } = await chrome.storage.local.get("workerTabId");
  console.log(workerTabId);
  
  let randomDely;
  if (data.url != "" && data.url !== undefined )
  {

    tabId = await openOrReuseTab(`https://pro.fiverr.com/inbox/${data.url}`);
    
    if (!tabId) return;
    console.log(data.url);
    
    await waitForTabLoaded(tabId);
    await sleep(10000);  // Allow time for the Fiverr page to fully load
    console.log("Tab loaded");
    await input_data1(tabId);
    await sleep(5000);
    console.log("tabid===>", tabId);
    
    for(let i = 0; i <= 200; i++){
      await processUnreadContacts(tabId);
      randomDely = getRandomDelay(2, 3);
      await sleep(randomDely * 1000);
    }

  }else{
    for(let i = 0; i <= 50; i++){
      await processUnreadContacts(workerTabId);
      randomDely = getRandomDelay(2, 3);
      await sleep(randomDely * 1000);
    }
  }
  
  chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1
  }); 
}


// ---------------------------
// RUN ONCE (NO LOOP)
// ---------------------------



async function getOrder() {
  console.log("getOrder");

  // Set an interval for repeated checks
  // while (true) {
    let state = await getRunning();
    console.log("Stopped");

    let data;

    if (!state) {
      await setRunning(false);
      console.log("Stopped !!!");
      return;
    }

    try {
      const base = (await getBackendBase()).replace(/\/+$/, "");
      const resp = await fetch(`${base}/api/us`);
      data = await resp.json();
      sendToUser(data);
    } catch (e) {
      await setRunning(false);
      console.error("getOrder error:", e);
    }

  //   console.log("delay", randomDely);

  //   await sleep(randomDely * 1000);
  // }
  return;

}

// ---------------------------
// POPUP MESSAGE HANDLER
// ---------------------------

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "START_MONITOR") {
    (async () => {
      await setRunning(true);
      // connectState = false;
      getOrder(); // ✅ RUN ONCE
      // sendToUser({ url: "thejcmstudio" });
      sendResponse({ running: true });
    })();
    return true;
  }

  if (msg.type === "STOP_MONITOR") {
    (async () => {
      await setRunning(false);
      // connectState = false;
      sendResponse({ running: false });
    })();
    return true;
  }

  if (msg.type === "GET_STATUS") {
    (async () => {
      sendResponse({ running: await getRunning() });
    })();
    return true;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm", alarm.name);

  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.local.get("isRunning", async (data) => {
    if (!data.isRunning) return;
    await getOrder();
  });
});