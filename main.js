//
// 1. CREATE A NEW GITHUB REPO
//
async function createRepo(repoName, token) {
  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify({
      name: repoName,
      private: false
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

//
// 2. WRITE OR UPDATE A FILE IN THE REPO
//
async function writeFile({ owner, repo, path, content, message, token }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Convert text → Base64
  const base64 = btoa(unescape(encodeURIComponent(content)));

  // Check if file exists (to get SHA)
  let sha = null;
  const getRes = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    }
  });

  if (getRes.ok) {
    const file = await getRes.json();
    sha = file.sha;
  }

  // Create or update file
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify({
      message,
      content: base64,
      sha
    })
  });

  const result = await putRes.json();
  if (!putRes.ok) throw new Error(result.message);
  return result;
}

//
// 3. HOOK UP THE BUTTON
//
document.getElementById("pushBtn").onclick = async () => {
  const path = document.getElementById("filePath").value;
  const content = document.getElementById("fileContent").value;

  // These values come from your GitHub App OAuth flow
  const token = window.rivlo_installation_token;   // set this after OAuth
  const owner = window.rivlo_github_username;      // set after OAuth
  const repo  = window.rivlo_repo_name;            // created at project start

  if (!token || !owner || !repo) {
    alert("GitHub not connected.");
    return;
  }

  try {
    const result = await writeFile({
      owner,
      repo,
      path,
      content,
      message: "Update from Rivlo AI",
      token
    });

    console.log(result);
    alert("File pushed to GitHub!");
  } catch (err) {
    console.error(err);
    alert("GitHub error: " + err.message);
  }
};