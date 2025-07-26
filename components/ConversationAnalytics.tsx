import React, { useState, useEffect, useMemo } from 'react';
import { Conversation, Message } from '../types';

interface ConversationAnalyticsProps {
  conversations: Conversation[];
  onClose: () => void;
}

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageMessagesPerConversation: number;
  totalWords: number;
  averageWordsPerMessage: number;
  filesUploaded: number;
  mostActiveDay: string;
  mostActiveHour: number;
  conversationLengths: number[];
  dailyActivity: { date: string; messages: number }[];
  hourlyActivity: { hour: number; messages: number }[];
  topKeywords: { word: string; count: number }[];
  responseTimeEstimate: number;
}

const ConversationAnalytics: React.FC<ConversationAnalyticsProps> = ({
  conversations,
  onClose
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'activity' | 'content'>('overview');

  const analyticsData = useMemo(() => {
    const now = new Date();
    const cutoffDate = selectedTimeRange === 'all' ? new Date(0) : 
      new Date(now.getTime() - (selectedTimeRange === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000);

    // Filter conversations by time range (using creation time approximation)
    const filteredConversations = conversations.filter(conv => {
      // Approximate creation time from first message or conversation ID
      const creationTime = conv.messages.length > 0 ? 
        new Date(parseInt(conv.id)) : new Date();
      return creationTime >= cutoffDate;
    });

    const allMessages = filteredConversations.flatMap(conv => conv.messages);
    const userMessages = allMessages.filter(msg => msg.role === 'user');
    const aiMessages = allMessages.filter(msg => msg.role === 'model');

    // Word counting
    const totalWords = allMessages.reduce((sum, msg) => 
      sum + msg.content.split(/\s+/).filter(word => word.length > 0).length, 0);

    // File counting
    const filesUploaded = allMessages.reduce((sum, msg) => 
      sum + (msg.files?.length || 0), 0);

    // Activity analysis
    const messagesByDate = new Map<string, number>();
    const messagesByHour = new Map<number, number>();

    allMessages.forEach(msg => {
      // Approximate timestamp from conversation ID
      const timestamp = new Date(parseInt(msg.role === 'user' ? 
        filteredConversations.find(c => c.messages.includes(msg))?.id || '0' : '0'));
      
      const dateKey = timestamp.toISOString().split('T')[0];
      const hour = timestamp.getHours();

      messagesByDate.set(dateKey, (messagesByDate.get(dateKey) || 0) + 1);
      messagesByHour.set(hour, (messagesByHour.get(hour) || 0) + 1);
    });

    // Find most active day and hour
    let mostActiveDay = '';
    let maxDayMessages = 0;
    messagesByDate.forEach((count, date) => {
      if (count > maxDayMessages) {
        maxDayMessages = count;
        mostActiveDay = date;
      }
    });

    let mostActiveHour = 0;
    let maxHourMessages = 0;
    messagesByHour.forEach((count, hour) => {
      if (count > maxHourMessages) {
        maxHourMessages = count;
        mostActiveHour = hour;
      }
    });

    // Daily activity for chart
    const dailyActivity = Array.from(messagesByDate.entries())
      .map(([date, messages]) => ({ date, messages }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Hourly activity for chart
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      messages: messagesByHour.get(hour) || 0
    }));

    // Keyword analysis
    const wordCounts = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    userMessages.forEach(msg => {
      const words = msg.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
      
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    const topKeywords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Conversation lengths
    const conversationLengths = filteredConversations.map(conv => conv.messages.length);

    // Estimate response time (mock data for now)
    const responseTimeEstimate = 2.5; // seconds

    return {
      totalConversations: filteredConversations.length,
      totalMessages: allMessages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      averageMessagesPerConversation: filteredConversations.length > 0 ? 
        allMessages.length / filteredConversations.length : 0,
      totalWords,
      averageWordsPerMessage: allMessages.length > 0 ? totalWords / allMessages.length : 0,
      filesUploaded,
      mostActiveDay,
      mostActiveHour,
      conversationLengths,
      dailyActivity,
      hourlyActivity,
      topKeywords,
      responseTimeEstimate
    } as AnalyticsData;
  }, [conversations, selectedTimeRange]);

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; icon: string }> = ({
    title, value, subtitle, icon
  }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  const SimpleChart: React.FC<{ data: { label: string; value: number }[]; maxHeight?: number }> = ({
    data, maxHeight = 100
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end gap-1 h-24">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="bg-purple-500 rounded-t w-full min-h-[2px] transition-all duration-300"
              style={{
                height: `${maxValue > 0 ? (item.value / maxValue) * maxHeight : 2}px`
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Conversation Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Insights into your AI interactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'activity', name: 'Activity', icon: '📈' },
            { id: 'content', name: 'Content', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Conversations"
                  value={analyticsData.totalConversations}
                  icon="💬"
                />
                <StatCard
                  title="Total Messages"
                  value={analyticsData.totalMessages}
                  subtitle={`${analyticsData.userMessages} from you, ${analyticsData.aiMessages} from AI`}
                  icon="📨"
                />
                <StatCard
                  title="Words Written"
                  value={analyticsData.totalWords}
                  subtitle={`${Math.round(analyticsData.averageWordsPerMessage)} avg per message`}
                  icon="✍️"
                />
                <StatCard
                  title="Files Uploaded"
                  value={analyticsData.filesUploaded}
                  icon="📎"
                />
              </div>

              {/* Usage Patterns */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    📅 Most Active Day
                  </h4>
                  <p className="text-lg text-purple-600 dark:text-purple-400">
                    {analyticsData.mostActiveDay || 'No data'}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    🕐 Most Active Hour
                  </h4>
                  <p className="text-lg text-purple-600 dark:text-purple-400">
                    {analyticsData.mostActiveHour}:00
                  </p>
                </div>
              </div>

              {/* Conversation Length Distribution */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  📏 Conversation Lengths
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {analyticsData.conversationLengths.filter(l => l <= 5).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short (≤5)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {analyticsData.conversationLengths.filter(l => l > 5 && l <= 15).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Medium (6-15)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {analyticsData.conversationLengths.filter(l => l > 15 && l <= 30).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Long (16-30)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {analyticsData.conversationLengths.filter(l => l > 30).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Very Long (30+)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'activity' && (
            <div className="space-y-6">
              {/* Daily Activity */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  📈 Daily Message Activity
                </h4>
                <SimpleChart
                  data={analyticsData.dailyActivity.slice(-14).map(d => ({
                    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: d.messages
                  }))}
                />
              </div>

              {/* Hourly Activity */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  🕐 Hourly Activity Pattern
                </h4>
                <SimpleChart
                  data={analyticsData.hourlyActivity.map(h => ({
                    label: `${h.hour}h`,
                    value: h.messages
                  }))}
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard
                  title="Avg Messages/Conversation"
                  value={Math.round(analyticsData.averageMessagesPerConversation * 10) / 10}
                  icon="💬"
                />
                <StatCard
                  title="Avg Response Time"
                  value={`${analyticsData.responseTimeEstimate}s`}
                  subtitle="Estimated"
                  icon="⚡"
                />
                <StatCard
                  title="Productivity Score"
                  value={Math.min(100, Math.round((analyticsData.totalMessages / 30) * 10))}
                  subtitle="Messages per day"
                  icon="🎯"
                />
              </div>
            </div>
          )}

          {selectedTab === 'content' && (
            <div className="space-y-6">
              {/* Top Keywords */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  🔤 Most Used Keywords
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {analyticsData.topKeywords.slice(0, 12).map((keyword, index) => (
                    <div
                      key={keyword.word}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {keyword.word}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {keyword.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Statistics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    📊 Content Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your messages</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {analyticsData.userMessages} ({Math.round((analyticsData.userMessages / analyticsData.totalMessages) * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI responses</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {analyticsData.aiMessages} ({Math.round((analyticsData.aiMessages / analyticsData.totalMessages) * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Files shared</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {analyticsData.filesUploaded}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    📝 Writing Statistics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total words</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {analyticsData.totalWords.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg words/message</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Math.round(analyticsData.averageWordsPerMessage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unique keywords</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {analyticsData.topKeywords.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalytics;