const GITHUB_CONFIG = {
    owner: "ClementObspher",
    repo: "kifekoi",
    token: process.env.EXPO_PUBLIC_GITHUB_TOKEN || "",
}

export interface BugReport {
    title: string
    description: string
    steps: string[]
    expectedBehavior: string
    actualBehavior: string
    deviceInfo: {
        platform: string
        osVersion: string
        appVersion: string
        deviceModel?: string
    }
    priority: "low" | "medium" | "high" | "critical"
    category: "ui" | "performance" | "crash" | "feature" | "data" | "other"
    userEmail?: string
    screenshots?: string[]
}

export interface GitHubIssue {
    title: string
    body: string
    labels: string[]
    assignees?: string[]
}

function formatBugReportAsGitHubIssue(bugReport: BugReport): GitHubIssue {
    const priorityLabels = {
        low: "priority: low",
        medium: "priority: medium",
        high: "priority: high",
        critical: "priority: critical",
    }

    const categoryLabels = {
        ui: "type: ui",
        performance: "type: performance",
        crash: "type: crash",
        feature: "type: feature-request",
        data: "type: data",
        other: "type: other",
    }

    const stepsText = bugReport.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")

    const body = `## 🐛 Description du problème
${bugReport.description}

## 📱 Informations de l'appareil
- **Plateforme:** ${bugReport.deviceInfo.platform}
- **Version OS:** ${bugReport.deviceInfo.osVersion}
- **Version App:** ${bugReport.deviceInfo.appVersion}
${bugReport.deviceInfo.deviceModel ? `- **Modèle:** ${bugReport.deviceInfo.deviceModel}` : ""}

## 🔄 Étapes pour reproduire
${stepsText}

## ✅ Comportement attendu
${bugReport.expectedBehavior}

## ❌ Comportement observé
${bugReport.actualBehavior}

${bugReport.userEmail ? `## 📧 Contact utilisateur\n${bugReport.userEmail}` : ""}

---
*Rapport généré automatiquement depuis l'application Kifekoi*`

    return {
        title: `[BUG] ${bugReport.title}`,
        body,
        labels: ["bug", priorityLabels[bugReport.priority], categoryLabels[bugReport.category], "client-report"],
    }
}

async function createGitHubIssue(githubIssue: GitHubIssue): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
    if (!GITHUB_CONFIG.token) {
        return {
            success: false,
            error: "Token GitHub non configuré. Ajoutez EXPO_PUBLIC_GITHUB_TOKEN dans vos variables d'environnement.",
        }
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GITHUB_CONFIG.token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: githubIssue.title,
                body: githubIssue.body,
                labels: githubIssue.labels,
                assignees: githubIssue.assignees || [],
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`GitHub API Error ${response.status}: ${errorData.message || response.statusText}`)
        }

        const result = await response.json()
        return {
            success: true,
            issueUrl: result.html_url,
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'issue GitHub:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        }
    }
}

export async function submitBugReport(bugReport: BugReport): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
    try {
        const githubIssue = formatBugReportAsGitHubIssue(bugReport)

        const result = await createGitHubIssue(githubIssue)

        if (result.success) {
            console.log("✅ Issue GitHub créée avec succès:", result.issueUrl)
        }

        return result
    } catch (error) {
        console.error("Erreur lors de l'envoi du rapport de bug:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        }
    }
}
