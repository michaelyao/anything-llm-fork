const { EncryptionManager } = require("../EncryptionManager");
const logger = require("../logger")

// When running locally will occupy the 0.0.0.0 hostname space but when deployed inside
// of docker this endpoint is not exposed so it is only on the Docker instances internal network
// so no additional security is needed on the endpoint directly. Auth is done however by the express
// middleware prior to leaving the node-side of the application so that is good enough >:)
class CollectorApi {
  constructor() {
    const { CommunicationKey } = require("../comKey");
    this.comkey = new CommunicationKey();
    this.endpoint = `http://0.0.0.0:${process.env.COLLECTOR_PORT || 8888}`;
  }

  log(text, ...args) {
    console.log(`\x1b[36m[CollectorApi]\x1b[0m ${text}`, ...args);
  }

  #attachOptions() {
    return {
      whisperProvider: process.env.WHISPER_PROVIDER || "local",
      WhisperModelPref: process.env.WHISPER_MODEL_PREF,
      openAiKey: process.env.OPEN_AI_KEY || null,
    };
  }

  async online() {
    logger.debug(`collector.online ${this.endpoint}`)
    return await fetch(this.endpoint)
      .then((res) => res.ok)
      .catch(() => false);
  }

  async acceptedFileTypes() {
    logger.debug(`collector.acceptedFileTypes ${this.endpoint}/accepts`)
    return await fetch(`${this.endpoint}/accepts`)
      .then((res) => {
        if (!res.ok) throw new Error("failed to GET /accepts");
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        logger.error(e.message);
        return null;
      });
  }

  async processDocument(filename = "") {
    logger.debug(`collector.processDocument filename: ${filename}`)
    if (!filename) return false;

    const data = JSON.stringify({
      filename,
      options: this.#attachOptions(),
    });
    logger.debug(`collector.processDocument ${this.endpoint}/process ${data}`)
    try{
      const response = await fetch(`${this.endpoint}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Integrity": this.comkey.sign(data),
          "X-Payload-Signer": this.comkey.encrypt(
            new EncryptionManager().xPayload
          ),
        },
        body: data,
      })
      if (!response.ok) throw new Error("Response could not be completed");
      const res = await response.json();
      logger.debug(`collector.processDocument response: ${JSON.stringify(res, null, "")}`)
      
      return res;
    }
    catch(e){
        logger.error(e.message);
        logger.error(`error when calling collector process ${e}`)
        return { success: false, reason: e.message, documents: [] };
    }

  }

  async processLink(link = "") {
    if (!link) return false;

    const data = JSON.stringify({ link });
    logger.debug(`collector.processLink ${this.endpoint}/process-link. link: ${data}`)
    return await fetch(`${this.endpoint}/process-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Integrity": this.comkey.sign(data),
        "X-Payload-Signer": this.comkey.encrypt(
          new EncryptionManager().xPayload
        ),
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          logger.error(`collector.processLink error response: ${JSON.stringify(res.json())}`)
          throw new Error("Response could not be completed");
        }

        logger.debug(`collector.processLink response: ${JSON.stringify(res.json(), null, "")}`)
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        logger.error(e.message);
        return { success: false, reason: e.message, documents: [] };
      });
  }

  async processRawText(textContent = "", metadata = {}) {
    const data = JSON.stringify({ textContent, metadata });
    logger.debug(`collector.processRawText ${this.endpoint}/process-raw-text. link: ${data}`)
    return await fetch(`${this.endpoint}/process-raw-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Integrity": this.comkey.sign(data),
        "X-Payload-Signer": this.comkey.encrypt(
          new EncryptionManager().xPayload
        ),
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          logger.error(`collector.processRawText error response: ${JSON.stringify(res.json())}`)
          throw new Error("Response could not be completed");
        }
        logger.debug(`collector.processRawText response: ${JSON.stringify(res.json(), null, "")}`)
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        logger.error(e.message);
        return { success: false, reason: e.message, documents: [] };
      });
  }

  // We will not ever expose the document processor to the frontend API so instead we relay
  // all requests through the server. You can use this function to directly expose a specific endpoint
  // on the document processor.
  async forwardExtensionRequest({ endpoint, method, body }) {
    logger.debug(`collector.forwardExtensionRequest ${this.endpoint}${endpoint}. method: ${JSON.stringify(method)}.  body: ${JSON.stringify(body)}`)
    return await fetch(`${this.endpoint}${endpoint}`, {
      method,
      body, // Stringified JSON!
      headers: {
        "Content-Type": "application/json",
        "X-Integrity": this.comkey.sign(body),
        "X-Payload-Signer": this.comkey.encrypt(
          new EncryptionManager().xPayload
        ),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Response could not be completed");
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        logger.error(e.message);
        return { success: false, data: {}, reason: e.message };
      });
  }

  async getLinkContent(link = "") {
    if (!link) {
      logger.debug(`collector.getLinkContent empty link`)
      return false;
    }
    
    const data = JSON.stringify({ link });
    logger.debug(`collector.getLinkContent link: ${data}`)
    return await fetch(`${this.endpoint}/util/get-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Integrity": this.comkey.sign(data),
        "X-Payload-Signer": this.comkey.encrypt(
          new EncryptionManager().xPayload
        ),
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          logger.error(`collector.getLinkContent error res: ${JSON.stringify(res.json(), null, "")}`)
          throw new Error("Response could not be completed");
        }
        logger.debug(`collector.getLinkContent res: ${JSON.stringify(res.json(), null, "")}`)
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        logger.error(e.message);
        return { success: false, content: null };
      });
  }
}

module.exports.CollectorApi = CollectorApi;
