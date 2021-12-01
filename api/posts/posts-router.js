// implement your posts router here
const express = require("express");
const router = express.Router();

const Model = require("./posts-model");

// get all posts
// not using the request object so replacing it with _
router.get("/", (_, res) => {
  Model.find()
    .then((posts) => res.status(200).json(posts))
    .catch(() =>
      res
        .status(500)
        .json({ message: "The posts information could not be retrieved" })
    );
});

// get post by id
router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then((post) => {
      if (!post) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
        return;
      }

      res.status(200).json(post);
    })
    .catch(() =>
      res
        .status(500)
        .json({ message: "The post information could not be retrieved" })
    );
});

// create a new "post" lol.
router.post("/", async (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
    return;
  }

  Model.insert(req.body)
    .then(({ id }) => {
      Model.findById(id)
        .then((post) => res.status(201).json(post))
        .catch(() =>
          res
            .status(404)
            .json({ message: "The post information could not be retrieved" })
        );
    })
    .catch(() =>
      res.status(500).json({
        message: "There was an error while saving the post to the database",
      })
    );
});
// update a post
router.put("/:id", (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
    return;
  }

  Model.update(req.params.id, req.body)
    .then((count) => {
      if (!count) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });

        return;
      }

      if (count === 1) {
        Model.findById(req.params.id)
          .then((post) => {
            res.status(200).json(post);
          })
          .catch(() =>
            res
              .status(500)
              .json({ message: "The post information could not be retrieved" })
          );
      }

      if (count !== 1) {
        throw new Error();
      }
    })
    .catch(() =>
      res
        .status(500)
        .json({ message: "The post information could not be modified" })
    );
});
// delete a post
router.delete("/:id", async (req, res) => {
  const deletedPost = await Model.findById(req.params.id);

  Model.remove(req.params.id)
    .then((count) => {
      if (!count || !deletedPost) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });

        return;
      }

      res.status(200).json(deletedPost);
    })
    .catch(() =>
      res.status(500).json({ message: "The post could not be removed" })
    );
});

// get comments on a post
router.get("/:id/comments", (req, res) => {
  Model.findPostComments(req.params.id)
    .then((comments) => {
      comments.length === 0
        ? res
            .status(404)
            .json({ message: "The post with the specified ID does not exist" })
        : res.status(200).json(comments);
    })
    .catch(() =>
      res
        .status(500)
        .json({ message: "The comments information could not be retrieved" })
    );
});

module.exports = router;
