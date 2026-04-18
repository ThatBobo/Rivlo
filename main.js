// ===============================
// Rivlo REAL GitHub main.js
// ===============================

// 1. Create a new GitHub repo
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

// 2. Write or update a file in the repo
async function writeFile({ owner, repo, path, content, message, token }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Convert text → Base64
  const base64 = btoa(unescape(encodeURIComponent(content)));

  // Check if file exists (to get SHA)
  let sha = null;
  const getRes = await fetch(url, {
    headers: {
      "Authorization": `token ${token}`,
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

// 3. Hook up the button
document.getElementById("pushBtn").onclick = async () => {
  const path = document.getElementById("filePath").value.trim();
  const content = document.getElementById("fileContent").value;

  if (!path) {
    alert("Enter a file path, e.g. src/App.jsx");
    return;
  }

  if (!content) {
    alert("Enter file content.");
    return;
  }

  // These MUST already exist (from your GitHub OAuth flow)
  const token = "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";
  const owner = "ThatBobo";
  const repo  = "Rivlo-Test";

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
      message: "Update from Rivlo",
      token
    });

    console.log("GitHub response:", result);
    alert("File pushed to GitHub!");
  } catch (err) {
    console.error(err);
    alert("GitHub error: " + err.message);
  }
};
