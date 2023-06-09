from flask import Flask, render_template
from chess_engine import *

app = Flask(__name__)


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/menu")
def menu():
    return render_template("menu.html")


@app.route("/game")
def game():
    return render_template("game.html")


@app.route("/selfgame")
def selfgame():
    return render_template("selfgame.html")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/modeling")
def modeling():
    return render_template("modeling.html")


@app.route("/technology")
def tech():
    return render_template("technology.html")


# got the idea from https://github.com/brokenloop/FlaskChess/blob/master/flask_app.py
@app.route("/move/<int:depth>/<path:fen>")
def get_move(depth, fen):
    engine = Engine(fen)
    prediction = engine.get_move()
    return prediction


if __name__ == "__main__":
    app.run(debug=True)
