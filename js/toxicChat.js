class ToxicMessage {
  #keywords = [];
  #operation;
  #sent;
  constructor(keywords, operation) {
    this.#keywords = keywords;
    this.#operation = operation;
    this.#sent = false;
  }
  get keywords() {
    return this.#keywords;
  }
  get operation() {
    return this.#operation;
  }
  set sent(value) {
    this.#sent = true;
  }
  get sent() {
    return this.#sent;
  }
}
class ToxicMessageRepository {
  #toxicMessages = [];
  constructor() {
    const messages = [
      [["bye", "see ya", "ciao", "goodbye"], "/bye/:from"],
      [["birthday"], "/bday/:name/:from"],
      [["fuck", "stupid"], "/asshole/:from"],
      [["fuck", "stupid"], "/family/:from"],
      [["fuck", "stupid"], "/too/:from"],
      [["programming", "java", "css"], "/caniuse/javaFX/:from"],
      [["why"], "/because/:from"],
      [["random"], "/cup/:from"],
      [["random"], "/back/:name/:from"],
      [["random"], "/bag/:from"],
      [["random"], "/blackadder/:name/:from"],
      [["random"], "/bm/:name/:from"],
      [["random"], "/cocksplat/:name/:from"],
      [["random"], "/cool/:from"],
      [["random"], "/dense/:from"],
      [["random"], "/deraadt/:name/:from"],
      [["random"], "/donut/:name/:from"],
      [["random"], "/fascinating/:from"],
      [["random"], "/fewer/:name/:from"],
      [["random"], "/flying/:from"],
      [["random"], "/outside/:name/:from"],
      [["random"], "/nugget/:name/:from"],
      [["random"], "/ridiculous/:from"],
      [["question"], "/maybe/:from"],
      [["question"], "/yeah/:from"],
      [["noMoreAnswers"], "/holygrail/:from"],
      [["noMoreAnswers"], "/understand/:name/:from"],
    ];
    this.addToxicMessages(messages);
  }
  addToxicMessages(keywordsOperationArr) {
    this.#toxicMessages = keywordsOperationArr.map(
      (arr) => new ToxicMessage(arr[0], arr[1])
    );
  }
  giveOperation(input) {
    let message;
    switch (true) {
      case this.noMoreMessages:
        message =
          this.findNotSentMessageWithKeyword("noMoreAnswers") ||
          this.#toxicMessages[this.#toxicMessages.length - 1];
        break;
      case this.isQuestion(input) && !input.split(" ").includes("why"):
        message = this.findNotSentMessageWithKeyword("question");
        break;
      default:
        message = this.findNotSentMessageWithKeyword(input);
        if (!message) {
          message = this.findNotSentMessageWithKeyword("random");
        }
        break;
    }
    message.sent = true;
    return message.operation;
  }

  findNotSentMessageWithKeyword(input) {
    return this.notSentMessages.find(({ keywords }) =>
      input
        .split(" ")
        .some((k) => k.length >= 3 && keywords.join(" ").includes(k))
    );
  }
  get notSentMessages() {
    return this.#toxicMessages.filter(({ sent }) => sent == false);
  }

  get noMoreMessages() {
    return this.notSentMessages.length <= 12;
  }

  isQuestion(input) {
    return input.split("").includes("?");
  }
}

class ToxicLiveChat {
  #toxicMessageRepo;
  name;
  constructor() {
    this.#toxicMessageRepo = new ToxicMessageRepository();
    this.setupMessageInput();
  }

  async getMessage(operation) {
    const op = operation.replace(":name", this.name);
    const response = await fetch(`https://www.foaas.com${op}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTPError: ${response.status}`);
    }
    const json = await response.json();
    this.botMessageToHTML(json.message);
  }

  askQuestion(input) {
    switch (true) {
      case input.length < 2:
        this.botMessageToHTML("What the fuck does that even mean?");
        break;
      case !this.name:
        this.name = input;
        this.botMessageToHTML(`What the fuck is your problem ${this.name}?`);
        break;

      default:
        this.getMessage(
          this.#toxicMessageRepo.giveOperation(input.toLowerCase())
        );
        break;
    }
  }
  setupMessageInput() {
    document.getElementById("send").onclick = () => {
      if (searchBox.value) {
        this.userMessageToHTML(searchBox.value);
        this.askQuestion(searchBox.value);
      }
      searchBox.value = "";
    };
    const searchBox = document.getElementById("messageInput");
    searchBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (searchBox.value) {
          this.userMessageToHTML(searchBox.value);
          this.askQuestion(searchBox.value);
        }
        searchBox.value = "";
      }
    });
    searchBox.focus();
  }

  async botMessageToHTML(text) {
    if (!text) return;
    const messages = document.getElementById("messages");

    messages.innerHTML += `
    <div class="direct-chat-msg">
      <div class="direct-chat-info clearfix">
        <span class="direct-chat-name pull-left">Toxic bot</span>
      </div>

      <img
        class="direct-chat-img"
        src="https://static.thenounproject.com/png/415514-200.png"
        alt="message user image"
      />

      <div class="direct-chat-text">
      </div>
    </div>`;
    document.getElementById("messages").lastChild.scrollIntoView();
    const textDiv = messages.lastChild.childNodes[5];
    await this.botTypingAnimToHTML(textDiv);
    textDiv.innerHTML = text;
    document.getElementById("messages").lastChild.scrollIntoView();
  }
  async botTypingAnimToHTML(div) {
    const aantal = Math.floor(Math.random() * 3);
    for (let i = 0; i < aantal; i++) {
      div.innerHTML = ".";
      for (let i = 0; i < 4; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        div.innerHTML += ".";
      }
    }
  }

  userMessageToHTML(text) {
    if (!text) return;
    const messages = document.getElementById("messages");
    messages.innerHTML += `<div class="direct-chat-msg right">
        <div class="direct-chat-info clearfix">
          <span class="direct-chat-name pull-right">
            ${this.name ?? "Anonymous"}</span>
        </div>
        <img
          class="direct-chat-img"
          src="https://img.icons8.com/color/36/000000/administrator-male.png"
          alt="message user image"
        />
        <div class="direct-chat-text">
        ${text}
      </div>`;
    document.getElementById("messages").lastChild.scrollIntoView();
  }
}

const init = () => {
  const liveChat = new ToxicLiveChat();
};

window.onload = init;
