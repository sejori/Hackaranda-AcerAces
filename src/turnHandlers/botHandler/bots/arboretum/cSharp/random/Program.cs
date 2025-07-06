// See https://aka.ms/new-console-template for more information
using System.Text.Json;
while (true) {
  var state = Console.ReadLine();
  var parsedState = JsonSerializer.Deserialize<State>(state);
  NewState newState = new NewState("RANDOM", parsedState?.messageID) ;

  Console.WriteLine(JsonSerializer.Serialize(newState));
}

class State 
{
  public object state {get; set;}
  public string messageID {get; set;}
}

class NewState
{

  public object move {get; set;}
  public string messageID {get; set;}
  public NewState(string amove, string amessageID)
  {
    move = amove;
    messageID = amessageID;
  }
}
