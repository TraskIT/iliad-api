'use strict';

const request = require('request');
const cheerio = require('cheerio');

const constants = require('../constants');

module.exports = (req, res) => {
  res.set('Content-Type', 'application/json');

  const token = req.query.token;

  const data = {
    iliad: {},
  };

  const headers = {
    cookie: `ACCOUNT_SESSID=${token}`, // cookie di accesso
  };

  if (token !== undefined) {
    
    const options = {
      url: constants.ILIAD_BASE_URL + constants.ILIAD_OPTION_URL.login,
      method: 'POST',
      headers,
    };

    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(body);

        try {
          const check = $(".steps-icon__text .green").first().text();

          data.iliad = {
            version: constants.CURRENT_APP_VERSION,
            user_name: $(".current-user__infos .bold").first().text(),
            user_id: Number($(".current-user__infos .smaller").first().text().replace("ID utente: ", "")),
            user_numtel: Number($(".current-user__infos .smaller").last().text().replace("Numero: ", "").replace(/\s/g, "")),
            sim: (check === 'SIM attivata'),
          };
          res.send(data);
        } catch (exception) {
          res.sendStatus(503);
        }
      }
    });
  } else {
    res.sendStatus(400);
  }
};
