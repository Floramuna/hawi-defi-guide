import Debug "mo:base/Debug";
import Text "mo:base/Text";

persistent actor MockLLM {

  // Temporary storage for last query
  transient var lastQuery: Text = "";

  // Simulate LLM response
  public func ask(input: Text) : async Text {
    lastQuery := input;
    Debug.print("LLM received: " # input);
    return "LLM Mock Response to: " # input;
  };
};