// Abstract Observer class
class Observer {
  update(subject) {
    throw new Error("Method update() must be implemented");
  }
}

// Abstract Subject class
class Subject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
    return this;
  }

  removeObserver(observer) {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
    return this;
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(this, data));
    return this;
  }
}

class TopicSubject extends Subject {
  constructor() {
    super();
    this.topic = null;
    this.action = null;
    this.message = null;
  }

  setTopic(topic) {
    this.topic = topic;
    return this;
  }

  setAction(action) {
    this.action = action;
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  notifyObservers() {
    return this.notify({
      topic: this.topic,
      action: this.action,
      message: this.message,
    });
  }
}

// Concrete Observer: UserNotifier
class UserNotifier extends Observer {
  update(subject, data) {
    console.log(`Notification for topic "${data.topic.title}": ${data.action}`);

    if (data.action === "new_message" && data.message) {
      console.log(
        `New message in topic "${data.topic.title}" from ${data.message.author.username}`
      );
    }
  }
}

// Concrete Observer: TopicStatsTracker
class TopicStatsTracker extends Observer {
  update(subject, data) {
    if (data.action === "access") {
      console.log(
        `Access to topic "${data.topic.title}" recorded. Total: ${data.topic.accessCount}`
      );
    }
  }
}

// Create singleton instances
const topicSubject = new TopicSubject();
const userNotifier = new UserNotifier();
const topicStatsTracker = new TopicStatsTracker();

// Register observers
topicSubject.addObserver(userNotifier);
topicSubject.addObserver(topicStatsTracker);

module.exports = {
  topicSubject,
  userNotifier,
  topicStatsTracker,
};
