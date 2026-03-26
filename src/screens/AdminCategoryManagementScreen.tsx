import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Plus, Check, X, Sparkles, Users } from 'lucide-react';
import { getPopularCustomSkills } from '../services/customSkills';
import { supabase } from '../lib/supabaseClient';

interface AdminCategoryManagementScreenProps {
  onBack: () => void;
}

export function AdminCategoryManagementScreen({ onBack }: AdminCategoryManagementScreenProps) {
  const [popularSkills, setPopularSkills] = useState<Array<{ skill: string; count: number }>>([]);
  const [officialCategories, setOfficialCategories] = useState<any[]>([]);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popular' | 'official' | 'training'>('popular');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load popular custom skills
      const popular = await getPopularCustomSkills(50);
      setPopularSkills(popular);

      // Load official categories with usage stats
      const { data: categories } = await supabase
        .from('official_task_categories')
        .select('*')
        .order('usage_count', { ascending: false });
      setOfficialCategories(categories || []);

      // Load training data summary
      const { data: training } = await supabase
        .from('skill_training_data')
        .select('task_category, action_type')
        .order('created_at', { ascending: false })
        .limit(100);
      setTrainingData(training || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const promoteSkillToOfficial = async (skillName: string) => {
    const confirmed = confirm(`Promote "${skillName}" to an official category?\n\nYou'll need to add matching keywords for the AI.`);
    if (!confirmed) return;

    const keywords = prompt(`Enter comma-separated keywords for "${skillName}":\n\nExample: code, coding, developer, programming`);
    if (!keywords) return;

    try {
      const { error } = await supabase
        .from('official_task_categories')
        .insert({
          category_name: skillName,
          keywords: keywords.split(',').map(k => k.trim().toLowerCase()),
          icon: '⭐',
          is_active: true,
          usage_count: 0,
        });

      if (error) throw error;

      alert(`✅ Successfully promoted "${skillName}" to official category!`);
      loadData();
    } catch (error: any) {
      alert(`Failed to promote skill: ${error.message}`);
    }
  };

  const updateCategoryKeywords = async (categoryId: string, currentKeywords: string[]) => {
    const newKeywords = prompt(
      'Update keywords (comma-separated):',
      currentKeywords.join(', ')
    );
    if (!newKeywords) return;

    try {
      const { error } = await supabase
        .from('official_task_categories')
        .update({
          keywords: newKeywords.split(',').map(k => k.trim().toLowerCase()),
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId);

      if (error) throw error;

      alert('✅ Keywords updated!');
      loadData();
    } catch (error: any) {
      alert(`Failed to update keywords: ${error.message}`);
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('official_task_categories')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId);

      if (error) throw error;

      loadData();
    } catch (error: any) {
      alert(`Failed to toggle category: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#CDFF00] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Category Management</h1>
          <div className="w-9" />
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-3 text-sm font-semibold ${
              activeTab === 'popular'
                ? 'text-black border-b-2 border-[#CDFF00]'
                : 'text-gray-500'
            }`}
          >
            Popular Skills
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 py-3 text-sm font-semibold ${
              activeTab === 'official'
                ? 'text-black border-b-2 border-[#CDFF00]'
                : 'text-gray-500'
            }`}
          >
            Official Categories
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-3 text-sm font-semibold ${
              activeTab === 'training'
                ? 'text-black border-b-2 border-[#CDFF00]'
                : 'text-gray-500'
            }`}
          >
            Training Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* POPULAR SKILLS TAB */}
        {activeTab === 'popular' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#CDFF00] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">Community-Driven Categories</p>
                  <p className="text-xs text-gray-600">
                    These custom skills are being used by multiple helpers. Promote popular ones to official categories!
                  </p>
                </div>
              </div>
            </div>

            {popularSkills.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No custom skills yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {popularSkills.map(({ skill, count }) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#CDFF00] transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{skill}</p>
                      <p className="text-xs text-gray-500">
                        Used by {count} {count === 1 ? 'helper' : 'helpers'}
                      </p>
                    </div>
                    <button
                      onClick={() => promoteSkillToOfficial(skill)}
                      className="bg-[#CDFF00] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#CDFF00]/90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Promote
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OFFICIAL CATEGORIES TAB */}
        {activeTab === 'official' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#CDFF00] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">AI Category Management</p>
                  <p className="text-xs text-gray-600">
                    Update keywords to improve AI categorization accuracy. More relevant keywords = better matching!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {officialCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-bold">{category.category_name}</p>
                        <p className="text-xs text-gray-500">
                          Used {category.usage_count} times
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">AI Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => updateCategoryKeywords(category.id, category.keywords)}
                    className="text-sm text-[#CDFF00] hover:text-black font-semibold transition-colors"
                  >
                    Update Keywords
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAINING DATA TAB */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#CDFF00]/10 rounded-lg border border-[#CDFF00]/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#CDFF00] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">Machine Learning Training Data</p>
                  <p className="text-xs text-gray-600">
                    Helper-task interactions are recorded to improve AI matching over time.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Interaction Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">Category Performance</h3>
              {Object.entries(
                trainingData.reduce((acc: any, item) => {
                  const category = item.task_category;
                  if (!acc[category]) acc[category] = { views: 0, messages: 0, accepts: 0 };
                  if (item.action_type === 'view') acc[category].views++;
                  if (item.action_type === 'message') acc[category].messages++;
                  if (item.action_type === 'accept') acc[category].accepts++;
                  return acc;
                }, {})
              ).map(([category, stats]: [string, any]) => (
                <div key={category} className="py-2 border-b border-gray-100 last:border-0">
                  <p className="font-semibold text-sm">{category}</p>
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    <span>👁️ {stats.views} views</span>
                    <span>💬 {stats.messages} messages</span>
                    <span>✅ {stats.accepts} accepts</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center">
              Recent {trainingData.length} interactions shown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
