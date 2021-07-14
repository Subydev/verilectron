var net = require("net");
const { dialog } = require("electron").remote;
var fs = require("fs");
var format = require("xml-formatter");
const settings = require("@electron/remote").require("electron-settings");
var client;
var connection = false;
var client_message = "";
var server_message = "";

initStats();

$(function () {
  Connect();
  SendCommand("<measure_get_point_mode />");
  SendCommand("<object_list />");
  setInterval(function () {
    SendCommand("<device_info id='1' />");
  }, 200);
});

async function initStats() {
  let droSeshbra = await settings.get("stats.droSessions");
  let cmdsSent = await settings.get("cmdLog.cmds");
  settings.set("stats.droSessions", droSeshbra + 1);
  $("#droSeshVal").text(droSeshbra);
  $("#lastCalVal").text(await settings.get("stats.lastCal"));
  $("#resizedVal").text((await settings.get("stats.resized")) + "x");
  $("#apiComCountVal").text(
    (await settings.get("stats.resized")) === undefined
      ? "0"
      : Object.keys(cmdsSent).length.toString()
  );
}

function Connect() {
  if (client_message.length == undefined) {
  }
  if (connection == false) {
    client = net.createConnection(33666, "localhost");
    client.on("error", function (err) {
      client_message = "Verisurf Connection Failed";
      UpdateTextarea();
      console.log(err);
    });
    client.on("connect", function () {
      client_message = "Verisurf Connection Opened";
      connection = true;
    });
    client.on("data", function (data) {
      server_message = data;
      UpdateTextarea();
    });
    client.on("close", function () {
      connection = false;
    });
  } else {
    client_message = "Verisurf Connection Already Established";
    UpdateTextarea();
  }
}

function Disconnect() {
  if (client) {
    client_message = "Verisurf Connection Closed";
    UpdateTextarea();
    client.destroy();
    client = undefined;
  }
}

function SendCommand(command) {
  if (client !== undefined && command !== undefined) {
    client.write(command + "\n");
    client_message = command;
    if (command.includes("trigger")) {
      $("#droTextContainer").addClass("bg-red-800");
      setTimeout(function () {
        $("#droTextContainer").removeClass("bg-red-800");
      }, 200);
    }
  }
}

function HandleRequiredResponses(rawResponse) {
  var fromBuffer = Buffer.from(rawResponse).toString();
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(fromBuffer, "text/xml");
  const addListData = (id, name, type) => {
    const svg = () => {
      if (type === "plan") {
        return reportsSvg;
      }
      if (type == "analysis") {
        return analysisSvg;
      }
      return featureSvg;
    };
    const analysisSvg = `
        <svg class="filter brightness-125" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" width="36px" fill="#375a7f">
            <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z"/></svg>
        `;

    const reportsSvg = `
        <svg class="filter brightness-125" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="20px" viewBox="0 0 24 24" width="36px" fill="#375a7f"><g>
            <rect fill="none" height="24" width="24"/>
            <path d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M20,18L4,18V6h5.17 l2,2H20V18z M18,12H6v-2h12V12z M14,16H6v-2h8V16z"/></g>
        </svg>
        `;
    const deleteSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" height="17px" viewBox="0 0 24 24" width="24px" fill="#a9a9a9">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
        </svg>
        `;

    const featureSvg = `
        <img src="./extraResources/${type}32.png"
            class="transform mx-auto mb-1 scale-75 w-auto h-7 filter brightness-125" />
        `;
    listData =
      `<div class="flex flex-row" id="row${id}">` +
      "<div onclick=\"SendCommand(`<object_selection_set ids='" +
      id +
      "' />`)\" class='flex flex-row flex w-full bg-gray-800 items-center cursor-pointer hover:bg-gray-400 hover:bg-opacity-50 rounded-sm'>" +
      "<div class='flex items-center h-8 space-x-2'>" +
      `${svg()}` +
      '<span class="text-sm">' +
      name +
      "</span>" +
      "</div>" +
      "</div>" +
      "<div class='flex bg-gray-800 items-center cursor-pointer hover:bg-red-400 hover:bg-opacity-50 rounded-sm' onclick=\"deleteVsObject(" +
      id +
      ')" `>' +
      `${deleteSvg}` +
      "</div>" +
      "</div>";

    return listData;
  };

  if (fromBuffer && fromBuffer.includes("data")) {
    var cmdReceived =
      xmlDoc.getElementsByTagName("command_received")[0].childNodes[0]
        .nodeValue;
    var data = xmlDoc.getElementsByTagName("data")[0].childNodes[0].nodeValue;
    switch (cmdReceived) {
      case "object_list":
        var respArr = xmlDoc.getElementsByTagName("object");
        //* Remove list data in case of events

        $(".objList").empty();

        for (let i = 0; i < respArr.length; i++) {
          if (respArr[i]["attributes"]["type"].nodeValue) {
            let type = respArr[i]["attributes"]["type"].nodeValue.toLowerCase();
            let featName = respArr[i].childNodes[0].nodeValue;
            let id = respArr[i]["attributes"]["id"].nodeValue;
            if (type === "plan") {
              $("#reportsTree").append(addListData(id, featName, type));
            }
            if (type === "analysis") {
              $("#analysisTree").append(addListData(id, featName, type));
            }
            if (type === "point") {
              $("#pointsTree").append(addListData(id, featName, type));
            }
            if (type === "alignment") {
              $("#alignmentsTree").append(addListData(id, featName, type));
            }
            if (type === "target") {
              $("#targetsTree").append(addListData(id, featName, type));
            } else if (
              [
                "circle",
                "plane",
                "line",
                "spline",
                "ellipse",
                "slot",
                "sphere",
                "cone",
                "cylinder",
                "paraboloid",
              ].indexOf(type) > -1
            ) {
              $("#featuresTree").append(addListData(id, featName, type));
            }
          }
        }
        break;
      case "object_delete":
        SendCommand("<object_list />");
        break;
      case "measure_get_point_mode":
        $("#pointModeSelect").val(data);
        break;

      case "device_info":
        if (data === xmlDoc.getElementsByTagName("device_info")[0]) {
          return;
        }
        if (fromBuffer.includes("DY")) {
          xValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DX"]
              .nodeValue;
          yValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DY"]
              .nodeValue;
          zValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["DZ"]
              .nodeValue;
          dValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["D3"]
              .nodeValue;

          if ($("#dText").hasClass("build")) {
            $("#xText").text("DX");
            $("#yText").text("DY");
            $("#zText").text("DZ");
            $("#dText").text("3D");
            $("#dText").removeClass("build");
          }
          let fixedx = parseFloat(xValue).toFixed(4);
          let fixedy = parseFloat(yValue).toFixed(4);
          let fixedz = parseFloat(zValue).toFixed(4);
          let fixedd = parseFloat(dValue).toFixed(4);
          if (fixedd) {
            if (fixedd > 0.02) {
              $("#dTextVal").addClass("text-blue-800");
              $("#dTextVal").removeClass("text-green-800");
              $("#dTextVal").removeClass("text-red-800");
            }
            if (fixedd < -0.02) {
              $("#dTextVal").addClass("text-red-800");
              $("#dTextVal").removeClass("text-blue-800");
              $("#dTextVal").removeClass("text-green-800");
            }
            if (fixedd < 0.02 && fixedd > -0.02) {
              $("#dTextVal").addClass("text-green-800");
              $("#dTextVal").removeClass("text-blue-800");
              $("#dTextVal").removeClass("text-red-800");
            }
          }

          if (fixedx) {
            if (fixedx > 0.02) {
              $("#xTextVal").addClass("text-blue-800");
              $("#xTextVal").removeClass("text-green-800");
              $("#xTextVal").removeClass("text-red-800");
            }
            if (fixedx < -0.02) {
              $("#xTextVal").addClass("text-red-800");
              $("#xTextVal").removeClass("text-blue-800");
              $("#xTextVal").removeClass("text-green-800");
            }
            if (fixedx < 0.02 && fixedx > -0.02) {
              $("#xTextVal").addClass("text-green-800");
              $("#xTextVal").removeClass("text-blue-800");
              $("#xTextVal").removeClass("text-red-800");
            }
          }

          if (fixedy) {
            if (fixedd > 0.02) {
              $("#yTextVal").addClass("text-blue-800");
              $("#yTextVal").removeClass("text-green-800");
              $("#yTextVal").removeClass("text-red-800");
            }
            if (fixedy < -0.02) {
              $("#yTextVal").addClass("text-red-800");
              $("#yTextVal").removeClass("text-blue-800");
              $("#yTextVal").removeClass("text-green-800");
            }
            if (fixedy < 0.02 && fixedy > -0.02) {
              $("#yTextVal").addClass("text-green-800");
              $("#yTextVal").removeClass("text-blue-800");
              $("#yTextVal").removeClass("text-red-800");
            }
          }

          if (fixedz) {
            if (fixedz > 0.02) {
              $("#zTextVal").addClass("text-blue-800");
              $("#zTextVal").removeClass("text-green-800");
              $("#zTextVal").removeClass("text-red-800");
            }
            if (fixedz < -0.02) {
              $("#zTextVal").addClass("text-red-800");
              $("#zTextVal").removeClass("text-blue-800");
              $("#zTextVal").removeClass("text-green-800");
            }
            if (fixedz < 0.02 && fixedz > -0.02) {
              $("#zTextVal").addClass("text-green-800");
              $("#zTextVal").removeClass("text-blue-800");
              $("#zTextVal").removeClass("text-red-800");
            }
          }

          $("#xTextVal").text(fixedx);
          $("#yTextVal").text(fixedy);
          $("#zTextVal").text(fixedz);
          $("#dTextVal").text(fixedd);
        } else {
          if (!$("#dText").hasClass("build")) {
            $("#dTextVal").removeClass(
              "text-red-800 text-green-800 text-blue-800"
            );
            $("#yTextVal").removeClass(
              "text-red-800 text-green-800 text-blue-800"
            );
            $("#zTextVal").removeClass(
              "text-red-800 text-green-800 text-blue-800"
            );
            $("#xTextVal").removeClass(
              "text-red-800 text-green-800 text-blue-800"
            );
            $("#xText").text("X");
            $("#yText").text("Y");
            $("#zText").text("Z");
            $("#dText").text("D");
            $("#dText").addClass("build");
            $("#dTextVal").addClass("build");
          }

          xValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["X"]
              .nodeValue;
          yValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["Y"]
              .nodeValue;
          zValue =
            xmlDoc.getElementsByTagName("device_info")[0]["attributes"]["Z"]
              .nodeValue;
          let sqd =
            Math.pow(Number(xValue), 2) +
            Math.pow(Number(yValue), 2) +
            Math.pow(Number(zValue), 2);
          let trupo = Math.sqrt(sqd);

          $("#xTextVal").text(parseFloat(xValue).toFixed(4));
          $("#yTextVal").text(parseFloat(yValue).toFixed(4));
          $("#zTextVal").text(parseFloat(zValue).toFixed(4));
          $("#dTextVal").text(parseFloat(trupo).toFixed(4));
          // return (Math.sqrt((a * a) + (b * b)));
        }
        break;
    }
  }
}

function deleteVsObject(id) {
  $(".objList").empty();
  SendCommand("<object_delete id='" + id + "' />");
  SendCommand("<object_list />");
}
function UpdateTextarea() {
  var update = "";
  if (client_message.length) update += "CLIENT: " + client_message + "\r\n\r\n";
  if (server_message.length) update += "SERVER: " + server_message;
  if (server_message.length && server_message.includes("data"))
    HandleRequiredResponses(server_message);
  client_message = "";
  server_message = "";

  $("#results").val(update);
}

function togglePointMode() {
  var measType = document.getElementById("pointModeSelect");
  switch (measType.value) {
    case "0":
      SendCommand("<Measure_Set_Single />");
      break;
    case "1":
      SendCommand("<measure_set_cloud />");
      break;
    case "2":
      SendCommand("<measure_set_average />");
      break;
  }
}
