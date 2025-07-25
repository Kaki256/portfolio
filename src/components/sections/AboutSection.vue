<script setup lang="ts">
const affiliations = [
  {
    id: 'affiliation1',
    title: '東京科学大学',
    role: '理学院地球惑星科学科 学部3年',
    period: '2025年6月 - 現在',
    icon: '🏫',
  },
  {
    id: 'affiliation2',
    title: 'デジタル創作同好会traP',
    role: 'アルゴリズム班\nSysAd班\nゲーム班',
    period: '2025年6月 - 現在',
    icon: '🎮',
  },
  {
    id: 'affiliation3',
    title: 'C-lock-row',
    role: '副部長 兼 総補佐',
    period: '2025年6月 - 現在',
    icon: '🧩',
  },
]

const interests = [
  { id: 'interest1', title: 'フロントエンド開発', icon: '💻' },
  { id: 'interest2', title: '謎解き制作', icon: '🧩' },
  { id: 'interest3', title: 'UI/UXデザイン', icon: '🎨' },
  { id: 'interest4', title: 'アルゴリズム', icon: '📊' },
]

const activities = [
  {
    id: 'activity1',
    title: '謎解きイベント参加',
    description: '月3~4回以上謎解きイベントに参加し、謎を楽しんでいます。',
    icon: '🔍',
  },
  {
    id: 'activity2',
    title: '競技プログラミング',
    description:
      'AtCoder を中心に定期的にコンテストに参加しています。現在の色は緑です。',
    icon: '⌨️',
  },
  {
    id: 'activity3',
    title: 'ハッカソン参加',
    description:
      '年に2回 traP 主催のハッカソンに参加し、新しいアイデアの実装に挑戦しています。',
    icon: '🚀',
  },
]

// 最終更新日

</script>

<template>
  <div class="about-container">
    <h2>About Me</h2>

    <div class="profile">
      <div class="profile-image">
        <img
          src="../../assets/images/profile.png"
          alt="Profile Image"
        >
      </div>

      <div class="profile-content">
        <p>
          　ぴなです。ソフトウェア開発と謎解きが大好きです。
          創造的で論理的な謎解きに情熱を持っています。
        </p>
        <p>
          技術的には、フロントエンド開発が得意で、特にVue.jsとTypeScriptを使ったアプリケーション開発に取り組んでいます。
          UIデザインとユーザー体験にもこだわり、機能的で美しいプロダクトを作ることを目指しています。
        </p>
        <p>
          また、謎解きの世界でもアクティブで、様々な謎解きイベントに参加したり、
          オリジナルの謎解きを作成したりしています。
        </p>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-title">
        <span class="title-icon">🏢</span> 所属
      </h3>

      <div class="card-grid affiliations">
        <div
          v-for="affiliation in affiliations"
          :key="affiliation.id"
          class="info-card"
        >
          <div class="card-icon">
            {{ affiliation.icon }}
          </div>
          <div class="card-content">
            <h4>{{ affiliation.title }}</h4>
            <p class="role">
              {{ affiliation.role }}
            </p>
            <p class="period">
              {{ affiliation.period }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-title">
        <span class="title-icon">✨</span> 興味・関心
      </h3>

      <div class="interest-tags">
        <div
          v-for="interest in interests"
          :key="interest.id"
          class="interest-tag"
        >
          <span class="interest-icon">{{ interest.icon }}</span>
          {{ interest.title }}
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-title">
        <span class="title-icon">📋</span> 活動
      </h3>

      <div class="card-grid activities">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="info-card activity-card"
        >
          <div class="card-icon">
            {{ activity.icon }}
          </div>
          <div class="card-content">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 900px;
  margin: 0 auto;
}

.profile {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 3rem;
}

.profile-image {
  flex: 0 0 250px;
}

.profile-image img {
  width: 100%;
  height: auto;
  border-radius: 50%;
  border: 5px solid var(--secondary-color);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.profile-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.profile-content {
  flex: 1;
}

.profile-content p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.7;
}

.info-section {
  margin-bottom: 2.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  color: var(--primary-color);
}

.title-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 184, 148, 0.25);
  border-radius: 50%;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-card {
  display: flex;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 1.5rem;
  border-left: 4px solid var(--primary-color);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.card-content {
  flex: 1;
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.card-content .role {
  font-weight: 500;
  margin-bottom: 0.3rem;
  line-height: 1.4;
  white-space: pre-line;
}

.card-content .period {
  font-size: 0.9rem;
  color: #666;
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.interest-tag {
  padding: 0.8rem 1.2rem;
  background: linear-gradient(
    135deg,
    rgba(0, 184, 148, 0.1),
    rgba(0, 206, 201, 0.1)
  );
  border-radius: 30px;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.interest-tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 206, 201, 0.2);
  border-color: var(--secondary-color);
}

.interest-icon {
  font-size: 1.2rem;
}

.activity-card {
  flex-direction: column;
}

.activity-card .card-icon {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.works-container {
  margin-top: 3rem;
}

.works-intro {
  text-align: center;
  margin-bottom: 2rem;
}

.section-last-updated {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .profile {
    flex-direction: column;
    text-align: center;
  }

  .profile-image {
    margin-bottom: 2rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    flex-direction: column;
  }

  .card-icon {
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .interest-tags {
    justify-content: center;
  }
}
</style>
