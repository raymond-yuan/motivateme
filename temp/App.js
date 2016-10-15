import React from 'react';
import ReactDOM from 'react-dom';
// class App extends React.Component {
//   render() {
//     return <div>Hello</div>
//   }
// }

// var userData = {raymond: [{task1:"task1"}], sumeet: [task1:"task1"]};
// var taskData = {task1: {deadline: "10.15.2016", action: "eat"}};


class App extends React.Component {

  constructor(props) {
    var d = new Date();
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {items: [{id: Date.now(), text: "task1", current: d.getMonth().toString() + "/" +
              d.getDate() + "/" +
              d.getFullYear(), deadline: Date.now().toString()}], text: '', deadline: ''};
  }

  render() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={this.state.items} />
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} value={this.state.text} />
          <button>{'Add #' + (this.state.items.length + 1)}</button>
        </form>

      </div>
    );
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleSubmit(e) {
      var d = new Date();
    e.preventDefault();
    var newItem = {
      // user: userData.raymond,
      text: this.state.text,
      id: Date.now(),
      current: d.getMonth().toString() + "/" +
                d.getDate() + "/" +
                d.getFullYear(),
      deadline: this.state.deadline
    };
    if (newItem.text.length > 0) {
      this.setState((prevState) => ({
        items: prevState.items.concat(newItem),
        text: '',
        dead: ''
      }));
    }
  }
}

class TodoList extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(item => (
          <li key={item.id}>{item.text, item.deadline}</li>
        ))}
      </ul>
    );
  }
}



export default App
