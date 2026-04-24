import Text "mo:core/Text";

module {
  // Pollinations.ai image generation endpoint (GET-based, no API key needed)
  public func buildImageGenUrl(prompt : Text) : Text {
    let encoded = urlEncode(prompt);
    "https://image.pollinations.ai/prompt/" # encoded # "?width=512&height=512&nologo=true";
  };

  // Not used for GET-based Pollinations.ai but kept for signature compatibility
  public func buildImageGenBody(prompt : Text) : Text {
    "{\"prompt\":\"" # prompt # "\"}";
  };

  // Pollinations.ai returns the image directly (binary), not JSON.
  // We store the URL as the image reference. For JSON-based APIs, parse here.
  // Returns null if no valid URL can be extracted.
  public func extractImageUrl(rawJson : Text) : ?Text {
    // rawJson holds the URL from a GET request (the final URL after redirect)
    if (rawJson.size() > 0) ?rawJson else null;
  };

  // Percent-encode a prompt string for use in a URL path segment
  func urlEncode(text : Text) : Text {
    var result = "";
    text.toIter().forEach(func(c) {
      let encoded = charEncode(c);
      result := result # encoded;
    });
    result;
  };

  func charEncode(c : Char) : Text {
    // Pass-through safe characters: A-Z a-z 0-9 - _ . ~
    if (isAlphaNum(c) or c == '-' or c == '_' or c == '.' or c == '~') {
      Text.fromChar(c);
    } else if (c == ' ') {
      "%20";
    } else {
      // For simplicity, encode common punctuation used in prompts
      switch (c) {
        case '!' "%21";
        case '#' "%23";
        case '$' "%24";
        case '&' "%26";
        case '\'' "%27";
        case '(' "%28";
        case ')' "%29";
        case '*' "%2A";
        case '+' "%2B";
        case ',' "%2C";
        case '/' "%2F";
        case ':' "%3A";
        case ';' "%3B";
        case '=' "%3D";
        case '?' "%3F";
        case '@' "%40";
        case '[' "%5B";
        case ']' "%5D";
        case _ Text.fromChar(c);
      };
    };
  };

  func isAlphaNum(c : Char) : Bool {
    (c >= 'A' and c <= 'Z') or (c >= 'a' and c <= 'z') or (c >= '0' and c <= '9');
  };
};
