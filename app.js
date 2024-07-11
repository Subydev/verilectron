const net = require("net");
const myintro = introJs();
const psList = require("ps-list");
var dateFormat = require("dateformat");
const { get } = require("electron-settings");
const { addAbortSignal } = require("stream");
// const { O_NOFOLLOW } = require("constants");
//! IPC requires (require.remote from electron is depreciated)
const { dialog, shell } = require("@electron/remote").require("electron");
const log = require("@electron/remote").require("electron-log");
const pjson = require("@electron/remote").require("./package.json");
const settings = require("@electron/remote").require("electron-settings");
const regedit = require("@electron/remote").require("regedit");
var client;
var connection = false;
var client_message = "";
var server_message = "";
var verisurfRunning = false;
var vPath = {};

//*---------- Initialization FunctionS ---------->

//*?---------- Check User Storage Functions ---------->

const isMcamRunning = async () => {
  const plist = await psList();
  for (let i = 0; i < plist.length; i++) {
    if (plist[i].name == "Mastercam.exe") {
      $("#verisurfStatusAnimout, #verisurfStatusAnimin")
        .removeClass("bg-red-500  bg-red-500")
        .addClass("bg-green-500 bg-green-500");
      return true;
    }
  }
  return false;
};

userSetup();

async function userSetup() {
  const userSettings = await settings.get();
  const now = new Date();
  const currAppVer = pjson.version;

  if (!userSettings.stats) {
    console.log("New user found, creating settings");
    await settings.set("stats", {
      droSessions: 0,
      sessions: 0,
      resized: 0,
      ignorePopups: {
        toggled: true,
      },
    });
  }
  await settings.set("stats", {
    sessions: (await settings.get("stats.sessions")) + 1,
    resized: await settings.get("stats.resized"),
    currDate: dateFormat(now, "mm/dd/yy"),
    droSessions: (await settings.get("stats.droSessions")) + 1,
    lastCal: dateFormat(getRandomDate(), "mm/dd/yy"),
    currDate: dateFormat(now, "mm/dd/yy"),
    currAppVer: currAppVer,
    ignorePopups: {
      toggled: await settings.get("stats.ignorePopups.toggled"),
    },
  });
  $("#versionText").text(`${currAppVer}`);

  $("#popUpsChecked").prop({
    checked: await settings.get("stats.ignorePopups.toggled"),
  });
  if (!userSettings.tour) {
    handleCmdChange("<measure_point />");
    RunTutorial();
  }
  if (userSettings.tour) {
    contInit();
  }
}

//? Handle Intro Exit 
myintro.onexit(function () {
  myintro.showHints();
  $("#mdContent").hide();
  settings.setSync("tour", {
    completed: true,
  });
  contInit();
});

//? Cont User Init based on tour completion
async function contInit() {
  if (!(await isMcamRunning())) {
    $("#runMastercamModal").modal("show");
    bLaunchMcam();
  }
}

//TODO Some functionality missing to automatically open commands tab.
function togglePopups(e) {
  settings.setSync("stats.ignorePopups", {
    toggled: e.checked,
  });
}

//*?----------Check Mastercam Running ---------->
const bLaunchMcam = async () => {
  console.log("bLaunchMcam function called");

  const registryPaths = [
    // "HKLM\\SOFTWARE\\CNC Software, Inc.",
    "HKLM\\SOFTWARE\\CNC Software"
  ];

  const checkRegistryPath = (index) => {
    if (index >= registryPaths.length) {
      console.log("Finished checking all registry paths.");
      return;
    }

    console.log(`Checking registry path: ${registryPaths[index]}`);

    regedit.list(registryPaths[index], function (err, listResult) {
      if (err || !listResult || !listResult[registryPaths[index]]) {
        console.log(`Registry path not found: ${registryPaths[index]}`);
        checkRegistryPath(index + 1);
        return;
      }

      console.log(`Registry path found: ${registryPaths[index]}`);

      let listKeys = listResult[registryPaths[index]];
      let listObject = Object.keys(listKeys).map((key, i) => [
        Number(key),
        listKeys[key],
      ]);
      let arrRes = listObject[0][1];

      if (Array.isArray(arrRes)) {
        let newArr = removeKey(arrRes);
        console.log("Filtered array:", newArr);

        let textToInsert = "";
        $.each(newArr, function (count, item) {
          const itemRegistryPaths = [
            `HKLM\\SOFTWARE\\CNC Software, Inc.\\${item}`,
            `HKLM\\SOFTWARE\\CNC Software\\${item}`
          ];

          const checkItemRegistryPath = (itemIndex) => {
            if (itemIndex >= itemRegistryPaths.length) {
              console.log(`Finished checking item registry paths for: ${item}`);
              return;
            }

            console.log(`Checking item registry path: ${itemRegistryPaths[itemIndex]}`);

            regedit.list([itemRegistryPaths[itemIndex]], function (err, itemResult) {
              if (err || !itemResult || typeof itemResult[itemRegistryPaths[itemIndex]]?.values?.Directory?.value === "undefined") {
                console.log(`Item registry path not found or missing Directory value: ${itemRegistryPaths[itemIndex]}`);
                checkItemRegistryPath(itemIndex + 1);
                return;
              }

              console.log(`Item registry path found: ${itemRegistryPaths[itemIndex]}`);

              const itemDirVal = itemResult[itemRegistryPaths[itemIndex]].values.Directory.value;
              const filePath = itemDirVal + `Mastercam.exe`;
              setMCamSettings(count, filePath, item)
                .then((result) => {
                  console.log(`Settings set for item: ${item}`);
                })
                .catch((error) => {
                  console.error(`Error setting settings for item: ${item}`, error);
                  log.warn(error);
                });

              const text = `<a onClick="OpenVerisurf(this)" id="${item}" class="dropdown-item" href="#">${item.replace(
                "Mastercam",
                "Verisurf"
              )}</a>`;
              textToInsert += text;

              if (itemIndex === itemRegistryPaths.length - 1) {
                console.log("Appending text to dropdown menu:", textToInsert);
                $("#versionSelector").append(textToInsert);
              }
            });
          };

          checkItemRegistryPath(0);
        });
      } else {
        console.log("arrRes is not an array:", arrRes);
        // Handle the case when arrRes is not an array
      }
    });
  };

  function removeKey(arr) {
    arr.forEach((element, idx) => {
      if (element.length !== 14) {
        delete arr[idx];
      }
    });
    return arr.filter((v) => v != null);
  }

  checkRegistryPath(0);
};
//?Asyncs to handle the user storage settings
async function hasSettings(setting = "") {
  return await settings.has(setting);
}

async function getSettings(setting = "") {
  return await settings.get(setting);
}

async function setSettings(isIncrementing = false, setting = "", value = "") {
  if (!isIncrementing) {
    await settings.set(setting, value);
  }
  if (isIncrementing) {
    const oldVal = await settings.get(setting);
    await settings.set(setting, oldVal === undefined ? 0 : oldVal + 1);
  }
}
async function setMCamSettings(count, filePath, item) {
  console.log(filePath, item);

  await settings.set(`versions.${item}`, {
    exeName: "Mastercam.exe",
    directory: filePath,
  });
}

//?Run Tutorial
function RunTutorial() {
  myintro
    .setOptions({
      // tooltipClass: 'fixedTooltip',
      showProgress: true,
      showBullets: false,
      scrollToElement: false,
      steps: [
        {
          title: "Verisurf API Tour",
          intro: "Lets walk through a few steps to get started.",
        },
        {
          title: "Connect",
          intro:
            "Start by connecting to Verisurf, make sure the 'TCP' port is enabled in Verisurf SDK Preferences.",
          element: document.querySelector(".connectButton"),
        },
        {
          title: "Categories",
          intro: "Select from a Category of API Calls",
          element: document.querySelector(".categoryTour"),
        },
        {
          title: "Command",
          intro: "Browse for a command you would like to see an example of.",
          element: document.querySelector(".commandTour"),
        },
        {
          title: "ID",
          intro:
            "For certain commands, you need an ID that identifies something, you can set that here. Commands requiring an ID are shown inside the documentation.",
          element: document.querySelector(".idTour"),
        },
        {
          title: "Send Comand",
          intro: "Click here to send the command to Verisurf.",
          element: document.querySelector(".sendCommandtour"),
        },
        {
          title: "Results View",
          intro:
            "Once a command is sent, you can see the XML information Verisurf sends back. Typically this data is parsed, then used inside a programmers application.",
          element: document.querySelector(".textAreaTour"),
          position: "top",
        },
        {
          title: "DRO",
          intro:
            "Use Open DRO to open an external window to run Measurement commands such as build, measure and trigger.",
          element: document.querySelector(".droTour"),
          position: "right",
        },
        {
          title: "Markdown View",
          intro:
            "Whenever a Command is selected, the Markdown view is displayed for further information about the selected Command, such as parameters, requirements and response types.",
          element: document.querySelector(".mdTour"),
          position: "left",
        },

        {
          intro:
            "You're now ready to use the Verisurf API Sample App, for further questions and enhancements, please contact SDK@verisurf.com.",
        },
      ],
    })
    .start();
}

// Existing code...

function quickSearch() {
  let input = document.getElementById("quickSearch").value;
  input = input.toLowerCase();
  let x = VSApiFuncs;

  $(".quickSearchListResults").empty();

  for (i = 0; i < x.length; i++) {
    if (x[i].name.toLowerCase().includes(input)) {
      let text = `<li><a onClick="quickSearchItemSend('${x[i].val}')" class="dropdown-item w-full flex flex-row" id="quick-${x.indexOf(x[i])}" href="#">${x[i].name}</a></li>`;
      $(".quickSearchListResults").append(text);
    }
  }

  if (input.length == 0 || input == undefined) {
    $(".quickSearchListResults").empty();
  }
}

function quickSearchItemSend(val) {
  document.getElementById("quickSearch").value = val;
  $(".quickSearchListResults").empty();
  
  // Find the command in VSApiFuncs
  let selectedCommand = VSApiFuncs.find(cmd => cmd.val === val);
  
  if (selectedCommand) {
    // Populate the category dropdown
    let categorySelect = document.getElementById("categorySelect");
    let categoryFound = false;
    for (let i = 0; i < categorySelect.options.length; i++) {
      if (categorySelect.options[i].value === selectedCommand.category) {
        categorySelect.selectedIndex = i;
        categoryFound = true;
        break;
      }
    }
    
    // If category not found, select "All" or add the category
    if (!categoryFound) {
      let allOptionIndex = Array.from(categorySelect.options).findIndex(option => option.value === "All");
      if (allOptionIndex !== -1) {
        categorySelect.selectedIndex = allOptionIndex;
      } else {
        let newOption = new Option(selectedCommand.category, selectedCommand.category);
        categorySelect.add(newOption);
        categorySelect.selectedIndex = categorySelect.options.length - 1;
      }
    }
    
    // Trigger the showCommands function to update the command dropdown
    showCommands();
    
    // Select the command in the dropdown
    let commandSelect = document.getElementById("command");
    let commandFound = false;
    for (let i = 0; i < commandSelect.options.length; i++) {
      if (commandSelect.options[i].value === val) {
        commandSelect.selectedIndex = i;
        commandFound = true;
        break;
      }
    }
    
    // If command not found in dropdown, add it
    if (!commandFound) {
      let newOption = new Option(selectedCommand.name, selectedCommand.val);
      commandSelect.add(newOption);
      commandSelect.selectedIndex = commandSelect.options.length - 1;
    }
    
    // Trigger the handleCmdChange function to update any other UI elements
    handleCmdChange(val);
  }
}
// Add this to your existing window.onload or document.addEventListener("DOMContentLoaded", ...) function
document.getElementById("quickSearch").addEventListener("input", quickSearch);

// Existing code...
function sClosed() {
  $("#cmdTab").removeClass("ring ring-cyan-700 animate-pulse");
  $(".searchlistresults").empty();
  // $('.searchBar').val();
  document.getElementById("searchBar").value = ``;
}

//? Custom search field to search for commands
function searchMd() {
  let input = document.getElementById("searchBar").value;
  input = input.toLowerCase();
  let x = VSApiFuncs;

  for (i = 0; i < x.length; i++) {
    if (!x[i].name.toLowerCase().includes(input)) {
      $(".searchlistresults")
        .find(`#${[i]}`)
        .remove();
    } else {
      $(".searchlistresults")
        .find(`#${x.indexOf(x[i])}`)
        .remove();

      text = `<a onClick="searchItemSend('${
        x[i].val
      }')" class="dropdown-item w-full flex flex-row " id="${x.indexOf(
        x[i]
      )}" href="#">${x[i].name}</a>`;
      $(".searchlistresults").append(text);
    }
  }
  if (input.length == 0 || input == undefined) {
    $(".searchlistresults").empty();
  }
}

//?Add pulse animation for when the Command tab is opened
function searchItemSend(val) {
  $("#cmdTab").removeClass("ring ring-cyan-700 animate-pulse");
  generateMdSection(val);
}

//?Show log file Button
function showLog() {
  let path = log.transports.file.findLogPath();
  shell.openPath(path);
}

function Connect() {
  if (client_message.length == undefined) {
  }
  if (connection == false) {
    client = net.createConnection(33666, "localhost");
    client.on("error", function (err) {
      client_message = "Verisurf Connection Failed";
      UpdateTextarea();
      log.error(err);
    });
    client.on("connect", function () {
      client_message = "Verisurf Connection Opened";
      connection = true;
      $(
        "#apiStatusAnimin, #apiStatusAnimout, #verisurfStatusAnimin, #verisurfStatusAnimout"
      )
        .removeClass("bg-red-500  bg-red-500")
        .addClass("bg-green-500 bg-green-500");
      $("#connectButton").addClass("opacity-30");
      $("#disconnectButton").addClass("opacity-100");
    });
    client.on("data", function (data) {
      server_message = data;
      UpdateTextarea();
    });
    client.on("close", function () {
      $("#connectButton").removeClass("opacity-30");
      $("#disconnectButton").removeClass("opacity-100");

      connection = false;
    });
  } else {
    client_message = "Verisurf Connection Already Established";
    UpdateTextarea();
  }
}

function CustomCommand(cmd) {
  if (cmd == undefined) {
    $("#results").val("No Connection Found or you haven't selected a command.");
  }
  var cmd = $("#command").val();
  var param = $("#paramField").val();

  if (cmd.includes("device")) {
    cmd = `${cmd.slice(0, -2) + "id='" + param + "' />"}`;
  }
  if (cmd.includes("inspect")) {
    cmd = `${cmd.slice(0, -2) + "id='" + param + "' />"}`;
  }
  switch (cmd) {
    case "<import_data />":
      ImportDataFile();
      break;
    case "<import_cloud_mesh />":
      ImportCloudMesh();
      break;
    case "<device_cmm_ipp id='1' />":
      $("#cmmIppModal").modal("show");
      break;
    case "<object_info />":
      SendCommand("<object_info id='" + param + "' />");
      break;
    case "<object_delete />":
      SendCommand("<object_delete id='" + param + "' />");
      break;
    case "<object_info />":
      SendCommand("<object_info id='" + param + "' />");
      break;
    case "<object_set_alignment />":
      SendCommand("<object_set_alignment id='" + param + "' />");
      break;
    case "<object_selection_set />":
      SendCommand("<object_selection_set ids='" + param + "' />");
      break;
    case "<file_open />":
      FileOpen();
      $("#results").val("");
      break;
    case "<file_save />":
      FileSave();
      $("#results").val("");

      break;
    default:
      SendCommand(cmd);
  }
}

function Disconnect() {
  if (client) {
    client_message = "Verisurf Connection Closed";
    $("#cmdTab").removeClass("ring ring-cyan-700 animate-pulse");

    UpdateTextarea();

    client.destroy();
    client = undefined;

    $(
      "#verisurfStatusAnimout, #verisurfStatusAnimin, #apiStatusAnimin, #apiStatusAnimout"
    )
      .removeClass("bg-green-500")
      .addClass("bg-red-500");
  }
}

function SendCommand(command) {
  setSettings(true, `cmdLog.cmds.${command}`);
  // settings.set(`stats.commandsSent.${command}`, settings.get(`stats.commandsSent.${command}`)));
  if (client !== undefined && command !== undefined) {
    client.write(command + "\n");
    client_message = command;
  }
}

function FileOpen() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Files",
          extensions: ["mcam"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand("<file_open filename='" + filename + "' />");
  }
}

function FileSave() {
  if (client !== undefined) {
    var filename = dialog.showSaveDialog({
      filters: [
        {
          name: "Verisurf Files",
          extensions: ["mcam"],
        },
      ],
    });
    if (filename.length)
      SendCommand("<file_save filename='" + filename + "' />");
  }
}

function ImportDataFile() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Data Files",
          extensions: ["txt", "csv", "xyz", "dat", "ref", "des", "raz"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand("<import_data filename='" + filename + "' />");
  }
}

function CloseThis(e) {
  $(`#${e.id}`).modal("hide");
}

function ImportCloudMesh() {
  if (client !== undefined) {
    var filename = dialog.showOpenDialog({
      filters: [
        {
          name: "Verisurf Data Files",
          extensions: ["ascii", "stl", "obj", "ply"],
        },
      ],
      properties: ["openFile"],
    });
    if (filename.length)
      SendCommand(
        "<Import_Cloud_Mesh filename='" + filename + "' filetype='11' />"
      );
  }
}

function UpdateTextarea() {
  var update = "";
  if (client_message.length) update += "CLIENT: " + client_message + "\r\n\r\n";
  if (server_message.length) update += "SERVER: " + server_message;
  if (server_message.length && server_message.includes("data"))
    client_message = "";
  server_message = "";

  $("#results").val(update);
}

function SendIppCmd(e) {
  SendCommand("<device_cmm_ipp id='1' cmd='" + e + "' />");
  $("#cmmIppModal").modal("hide");
}

function handleCmdChange(e) {
  $("#cmdTab").addClass("ring ring-cyan-700 animate-pulse");
  let popup = settings.getSync("stats.ignorePopups.toggled");
  // $("#cmdTab").trigger()

  if (popup) {
    isSettingsPanelOpen = true;
    // $("#cmdTab").trigger()
  }

  generateMdSection(e);
}

function OpenDRO() {
  const { BrowserWindow } = require("@electron/remote");

  const win = new BrowserWindow({
    width: 1460,
    height: 1050,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true,
    },
  });

  win.loadURL(`file://${__dirname}//dro2.html`);
  // win.webContents.openDevTools()
  win.onbeforeunload = (e) => {
    Disconnect();
//!Disconnect before it is closed
    // Unlike usual browsers that a message box will be prompted to users, returning
    // a non-void value will silently cancel the close.
    // It is recommended to use the dialog API to let the user confirm closing the
    // application.
    e.returnValue = false; // equivalent to `return false` but not recommended
  };
}

function OpenScriptBuilder() {
  const { BrowserWindow } = require("@electron/remote");

  const win = new BrowserWindow({
    width: 1460,
    height: 1050,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true,
    },
  });

  win.loadURL(`file://${__dirname}//script_builder_screen//scriptBuidler.html`);
  // win.webContents.openDevTools()
  win.onbeforeunload = (e) => {
    Disconnect();
//!Disconnect before it is closed
    // Unlike usual browsers that a message box will be prompted to users, returning
    // a non-void value will silently cancel the close.
    // It is recommended to use the dialog API to let the user confirm closing the
    // application.
    e.returnValue = false; // equivalent to `return false` but not recommended
  };
}

async function OpenVerisurf(e) {
  let reqVer = `versions.${e.id}`;
  const mcamPath = getSettings(`${reqVer}.directory`)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      log.error(error);
    });

  const hasSetting = hasSettings(reqVer)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      log.error(error);
    });

  //?Double check if has settings then get and launch.
  if ((await hasSetting) === true) {
    const child = require("child_process").execFile;
    child(await mcamPath, function (err, data) {
      if (err) {
        $("#errorAlert").fadeIn();
        $("#errorAlert")
          .fadeTo(10000, 500)
          .slideUp(500, function () {
            $("#errorAlert").slideUp(500);
          });
        log.error(err);
        log.info(data);
        return;
      }
    });
  }
  $("#runMastercamModal").modal("hide");
}

function showCommands() {
  var startLen = 0;
  var endLen = 0;

  var listLen = document.getElementById("categorySelect");
  switch (listLen.value) {
    case "CAD":
      startLen = 0;
      endLen = 22;
      break;

    case "General":
      startLen = 22;
      endLen = 34;
      break;

    case "Device":
      startLen = 34;
      endLen = 45;
      break;

    case "Measure":
      startLen = 45;
      endLen = 63;
      break;

    case "Verisurf Database":
      startLen = 63;
      endLen = 72;
      break;
    case "Report":
      startLen = 72;
      endLen = 85;
      break;
    case "All":
      startLen = 0;
      endLen = VSApiFuncs.length;
      break;
  }
  $("#command").empty();
  for (var i = startLen; i < endLen; i++) {
    $("#command").append(
      "<option id='" +
        i +
        "' option value = '" +
        VSApiFuncs[i].val +
        "'>" +
        VSApiFuncs[i].name +
        "</option"
    );
  }
  $("#commandContainer").show();
}

function generateMdSection(e) {
  $("#mdContent").show();
  document.getElementById("cmdExpTitle").innerHTML = `${e.slice(1, -3)}`;
  // __dirname + '/../extraResources/'
  var filePath = `${__dirname + "/extraResources/" + e.slice(1, -3) + ".md"}`;
  const fs = require("fs");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      alert("An error ocurred reading the file :" + err.message);
      return;
    }
    const showdown = require("showdown");

    (converter = new showdown.Converter()), converter.setFlavor("github");
    converter.setOption("headerLevelStart", "3");
    (text = data), (html = converter.makeHtml(text));
    document.getElementById("mdBody").innerHTML = `${html}`;
  });
}

async function wasResized() {
  const resized = await settings.get("stats.resized");
  await settings.set("stats.resized", resized + 1);
}

function getRandomDate() {
  var today = new Date();
  var randDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - Math.floor(Math.random() * 18)
  );
  return randDay;
}
