document.addEventListener('DOMContentLoaded', function () {
  var POSTS_KEY = 'gg_blog_posts_v1';
  var LIKED_KEY = 'gg_blog_liked_v1';

  var yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var postsEl = document.getElementById('blogPosts');
  var emptyEl = document.getElementById('blogEmptyState');
  var composer = document.getElementById('blogComposer');
  if (!postsEl || !composer) return;

  function loadPosts() {
    try { return JSON.parse(localStorage.getItem(POSTS_KEY)) || []; }
    catch (e) { return []; }
  }
  function savePosts(posts) {
    try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); } catch (e) {}
  }
  function loadLiked() {
    try { return JSON.parse(localStorage.getItem(LIKED_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveLiked(map) {
    try { localStorage.setItem(LIKED_KEY, JSON.stringify(map)); } catch (e) {}
  }
  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function findPost(posts, id) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) return posts[i];
    }
    return null;
  }

  var likedMap = loadLiked();

  function render() {
    var posts = loadPosts().slice().reverse();
    postsEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = posts.length > 0;
    posts.forEach(function (post) {
      postsEl.appendChild(renderPost(post));
    });
  }

  function renderComment(c) {
    var div = document.createElement('div');
    div.className = 'blog-comment';
    div.innerHTML =
      '<div class="blog-comment-head"><span class="blog-comment-name"></span><span class="blog-comment-date"></span></div>' +
      '<p class="blog-comment-text"></p>';
    div.querySelector('.blog-comment-name').textContent = c.name;
    div.querySelector('.blog-comment-date').textContent = formatDate(c.date);
    div.querySelector('.blog-comment-text').textContent = c.text;
    return div;
  }

  function renderPost(post) {
    var article = document.createElement('article');
    article.className = 'blog-post reveal is-visible';
    article.dataset.postId = post.id;

    var liked = !!likedMap[post.id];

    article.innerHTML =
      '<div class="blog-post-head">' +
        '<h2 class="blog-post-title"></h2>' +
        '<button type="button" class="blog-post-delete" title="Delete post" aria-label="Delete post"><i class="fas fa-trash"></i></button>' +
      '</div>' +
      '<div class="blog-post-meta">' +
        (post.tag ? '<span class="blog-post-tag"></span>' : '') +
        '<span class="blog-post-date"></span>' +
      '</div>' +
      '<p class="blog-post-body"></p>' +
      '<div class="blog-post-actions">' +
        '<button type="button" class="blog-like-btn' + (liked ? ' is-liked' : '') + '"><i class="fas fa-heart"></i> <span class="blog-like-count">' + post.likes + '</span></button>' +
        '<button type="button" class="blog-comment-toggle"><i class="fas fa-comment"></i> <span class="blog-comment-count">' + post.comments.length + '</span> Comments</button>' +
      '</div>' +
      '<div class="blog-comments" hidden>' +
        '<div class="blog-comments-list"></div>' +
        '<form class="blog-comment-form">' +
          '<input type="text" class="blog-comment-name-input" placeholder="Your name" maxlength="40" required>' +
          '<input type="text" class="blog-comment-text-input" placeholder="Add a comment" maxlength="500" required>' +
          '<button type="submit" class="btn btn-secondary blog-comment-submit"><span>Comment</span></button>' +
        '</form>' +
      '</div>';

    article.querySelector('.blog-post-title').textContent = post.title;
    if (post.tag) article.querySelector('.blog-post-tag').textContent = post.tag;
    article.querySelector('.blog-post-date').textContent = formatDate(post.date);
    article.querySelector('.blog-post-body').textContent = post.body;

    var commentsList = article.querySelector('.blog-comments-list');
    post.comments.forEach(function (c) {
      commentsList.appendChild(renderComment(c));
    });

    article.querySelector('.blog-post-delete').addEventListener('click', function () {
      if (!window.confirm('Delete this post?')) return;
      savePosts(loadPosts().filter(function (p) { return p.id !== post.id; }));
      render();
    });

    article.querySelector('.blog-like-btn').addEventListener('click', function () {
      var all = loadPosts();
      var target = findPost(all, post.id);
      if (!target) return;
      var likedNow = !!likedMap[post.id];
      target.likes = Math.max(0, target.likes + (likedNow ? -1 : 1));
      likedMap[post.id] = !likedNow;
      saveLiked(likedMap);
      savePosts(all);
      render();
    });

    var commentsWrap = article.querySelector('.blog-comments');
    article.querySelector('.blog-comment-toggle').addEventListener('click', function () {
      commentsWrap.hidden = !commentsWrap.hidden;
    });

    article.querySelector('.blog-comment-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = article.querySelector('.blog-comment-name-input');
      var textInput = article.querySelector('.blog-comment-text-input');
      var name = nameInput.value.trim();
      var text = textInput.value.trim();
      if (!name || !text) return;
      var all = loadPosts();
      var target = findPost(all, post.id);
      if (!target) return;
      target.comments.push({ id: uid(), name: name, text: text, date: new Date().toISOString() });
      savePosts(all);
      render();
    });

    return article;
  }

  composer.addEventListener('submit', function (e) {
    e.preventDefault();
    var titleInput = document.getElementById('blogTitleInput');
    var tagInput = document.getElementById('blogTagInput');
    var bodyInput = document.getElementById('blogBodyInput');
    var title = titleInput.value.trim();
    var tag = tagInput.value.trim();
    var body = bodyInput.value.trim();
    if (!title || !body) return;

    var all = loadPosts();
    all.push({
      id: uid(),
      title: title,
      tag: tag,
      body: body,
      date: new Date().toISOString(),
      likes: 0,
      comments: []
    });
    savePosts(all);

    titleInput.value = '';
    tagInput.value = '';
    bodyInput.value = '';
    render();
  });

  render();
});
