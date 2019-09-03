const express = require("express");
const db = require("./data/db.js");

const server = express();

server.use(express.json()); // teaches express to parse JSON body
server.use(cors());

// ADD POST
server.post("/api/posts", (req, res) => {
  // read information sent by client
  const postInfo = req.body;

  // validate post
  if (postInfo.title && postInfo.contents) {
    db.insert(postInfo)
      .then(addedPost => {
        res.status(201).json(addedPost);
      })
      .catch(error => {
        res.json(error);
      });
  } else {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post.",
    });
  }
});

// ADD POST COMMENT
server.post("/api/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  const commentInfo = req.body;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        if (commentInfo.text) {
          if (postId == commentInfo.post_id) {
            db.insertComment(commentInfo)
              .then(addedCommentId => {
                db.findCommentById(addedCommentId.id).then(addedComment => {
                  res.status(201).json(addedComment);
                });
              })
              .catch(error => {
                res.status(500).json({
                  error:
                    "There was an error while saving the comment to the database",
                });
              });
          } else {
            res.status(400).json({
              errorMessage: "The post_id does not match the post id.",
            });
          }
        } else {
          res
            .status(400)
            .json({ errorMessage: "Please provide text for the comment." });
        }
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res.status(500).json({
        error: "There was an error while saving the comment to the database",
      });
    });
});

// GET ALL POSTS
server.get("/api/posts", (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

// GET POST BY ID
server.get("/api/posts/:id", (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        res.status(200).json(post);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

// GET COMMENTS FOR POST
server.get("/api/posts/:id/comments", (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        db.findPostComments(postId)
          .then(comments => {
            res.status(200).json(comments);
          })
          .catch(error => {
            res.status(500).json({
              error: "The comments information could not be retrieved.",
            });
          });
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res.status(500).json({
        error: "The comments information could not be retrieved.",
      });
    });
});

// DELETE A POST
server.delete("/api/posts/:id", (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      let deletedPost = post[0];

      if (post.length) {
        db.remove(postId)
          .then(success => {
            // Ask about 204 in TK
            res.status(200).json(deletedPost);
          })
          .catch(error => {
            res.status(500).json({ error: "The post could not be removed" });
          });
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res.status(500).json({ error: "The post could not be removed" });
    });
});

// EDIT A POST
server.put("/api/posts/:id", (req, res) => {
  const postId = req.params.id;
  const editedPost = req.body;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        if (editedPost.title && editedPost.contents) {
          db.update(postId, editedPost)
            .then(success => {
              db.findById(postId)
                .then(post => {
                  res.status(200).json(post);
                })
                .catch(error => {
                  res.status(500).json({
                    message: "The post with the specified ID does not exist.",
                  });
                });
            })
            .catch(error => {
              res
                .status(500)
                .json({ error: "The post information could not be modified." });
            });
        } else {
          res.status(400).json({
            errorMessage: "Please provide title and contents for the post.",
          });
        }
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The post information could not be modified." });
    });
});

module.exports = server; // CommonJS modules (node)
