'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';

interface GuideProvisionTabProps {
  postId: string;
  hospitalId: number;
}

interface GuideProvisionData {
  guide_provision_info: {
    hospital_info: any;
    campaign_info: any;
    post_medical_info: any;
    treatment_info: any;
    post_materials: any;
    clinical_context: any;
    publish_info: any[] | any;
  } | null;
  guide_provision_input: {
    persona_selection: {
      persona_name: string;
      persona_description: string;
    };
    keywords_guide: {
      region_keywords_guide: string[];
      hospital_keywords_guide: string[];
      symptom_keywords_guide: string[];
      procedure_keywords_guide: string[];
      treatment_keywords_guide: string[];
      target_keywords_guide: string[];
      writing_guide: string;
      is_completed: boolean;
      emoji_level_value: number;
    };
  } | null;
}

interface KeywordsFormData {
  region_keywords_guide: string[];
  hospital_keywords_guide: string[];
  symptom_keywords_guide: string[];
  procedure_keywords_guide: string[];
  treatment_keywords_guide: string[];
  target_keywords_guide: string[];
  writing_guide: string;
  emoji_level_value: number;
}

type KeywordField = keyof Pick<KeywordsFormData, 'region_keywords_guide' | 'hospital_keywords_guide' | 'symptom_keywords_guide' | 'procedure_keywords_guide' | 'treatment_keywords_guide' | 'target_keywords_guide'>;

export default function GuideProvisionTab({ postId, hospitalId }: GuideProvisionTabProps) {
  const [data, setData] = useState<GuideProvisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 편집 모드 상태들
  const [editingPersona, setEditingPersona] = useState(false);
  const [editingKeywords, setEditingKeywords] = useState(false);
  const [editingEmoji, setEditingEmoji] = useState(false);

  // 폼 데이터
  const [personaForm, setPersonaForm] = useState({ persona_name: '', persona_description: '' });
  const [keywordsForm, setKeywordsForm] = useState<KeywordsFormData>({
    region_keywords_guide: [],
    hospital_keywords_guide: [],
    symptom_keywords_guide: [],
    procedure_keywords_guide: [],
    treatment_keywords_guide: [],
    target_keywords_guide: [],
    writing_guide: '',
    emoji_level_value: 2
  });

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getCompletePostingWorkflow(postId);

        // CompletePostingWorkflow를 GuideProvisionData로 변환
        const guideData: GuideProvisionData = {
          guide_provision_info: (response.guide_provision_info || data?.guide_provision_info) as GuideProvisionData['guide_provision_info'],
          guide_provision_input: (response.guide_provision_input || data?.guide_provision_input) as GuideProvisionData['guide_provision_input']
        };

        setData(guideData);

        // 폼 데이터 초기화
        if (guideData.guide_provision_input) {
          setPersonaForm(guideData.guide_provision_input.persona_selection);
          setKeywordsForm(guideData.guide_provision_input.keywords_guide);
        }
      } catch (error) {
        console.error('가이드 제공 데이터 로드 실패:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]);

  // 키워드 저장
  const saveKeywordsGuide = async () => {
    try {
      setSaving(true);
      await adminApi.updateKeywordsGuide(postId, keywordsForm);
      setEditingKeywords(false);

      // 데이터 새로고침
      const response = await adminApi.getCompletePostingWorkflow(postId);
      const guideData: GuideProvisionData = {
        guide_provision_info: (response.guide_provision_info || data?.guide_provision_info) as GuideProvisionData['guide_provision_info'],
        guide_provision_input: (response.guide_provision_input || data?.guide_provision_input) as GuideProvisionData['guide_provision_input']
      };
      setData(guideData);
    } catch (error) {
      console.error('키워드 가이드 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 페르소나 저장
  const savePersona = async () => {
    try {
      setSaving(true);
      await adminApi.updatePersona(postId, personaForm);
      setEditingPersona(false);

      // 데이터 새로고침
      const response = await adminApi.getCompletePostingWorkflow(postId);
      const guideData: GuideProvisionData = {
        guide_provision_info: (response.guide_provision_info || data?.guide_provision_info) as GuideProvisionData['guide_provision_info'],
        guide_provision_input: (response.guide_provision_input || data?.guide_provision_input) as GuideProvisionData['guide_provision_input']
      };
      setData(guideData);
    } catch (error) {
      console.error('페르소나 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 이모지 레벨 저장
  const saveEmojiLevel = async () => {
    try {
      setSaving(true);
      await adminApi.updateEmojiLevel(postId, keywordsForm.emoji_level_value);
      setEditingEmoji(false);

      // 데이터 새로고침
      const response = await adminApi.getCompletePostingWorkflow(postId);
      const guideData: GuideProvisionData = {
        guide_provision_info: (response.guide_provision_info || data?.guide_provision_info) as GuideProvisionData['guide_provision_info'],
        guide_provision_input: (response.guide_provision_input || data?.guide_provision_input) as GuideProvisionData['guide_provision_input']
      };
      setData(guideData);
    } catch (error) {
      console.error('이모지 레벨 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 키워드 배열 관리 헬퍼 함수들
  const addKeyword = (field: KeywordField, keyword: string) => {
    if (keyword.trim() && !keywordsForm[field].includes(keyword.trim())) {
      setKeywordsForm(prev => ({
        ...prev,
        [field]: [...prev[field], keyword.trim()]
      }));
    }
  };

  const removeKeyword = (field: KeywordField, keyword: string) => {
    setKeywordsForm(prev => ({
      ...prev,
      [field]: prev[field].filter((k: string) => k !== keyword)
    }));
  };

  const handleKeywordInput = (field: KeywordField, value: string) => {
    if (value.includes(',')) {
      const keywords = value.split(',').map(k => k.trim()).filter(k => k);
      keywords.forEach(keyword => addKeyword(field, keyword));
      // 입력 필드 초기화 (실제로는 ref나 다른 방식으로 처리)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
        <span className="ml-2 text-neutral-600">데이터 로딩 중...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600">{error || '데이터를 불러올 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const info = data.guide_provision_info || {
    hospital_info: null,
    campaign_info: null,
    post_medical_info: null,
    treatment_info: null,
    post_materials: null,
    clinical_context: null,
    publish_info: null
  };
  const input = data.guide_provision_input || {
    persona_selection: { persona_name: '', persona_description: '' },
    keywords_guide: {
      region_keywords_guide: [],
      hospital_keywords_guide: [],
      symptom_keywords_guide: [],
      procedure_keywords_guide: [],
      treatment_keywords_guide: [],
      target_keywords_guide: [],
      writing_guide: '',
      is_completed: false,
      emoji_level_value: 2
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* 좌측: 정보 확인 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pr-4">
          {/* 병원 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">🏥 병원 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div><strong>병원명:</strong> {info.hospital_info?.name}</div>
              <div><strong>주소:</strong> {info.hospital_info?.address}</div>
              <div><strong>전화:</strong> {info.hospital_info?.phone}</div>
              <div><strong>웹사이트:</strong> {info.hospital_info?.website}</div>
              <div><strong>지역:</strong> {info.hospital_info?.region_info?.region_phrase}</div>
              <div><strong>키워드:</strong> {info.hospital_info?.hospital_keywords?.join(', ')}</div>
            </div>
          </div>

          {/* 캠페인 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">📊 캠페인 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div><strong>캠페인명:</strong> {info.campaign_info?.name}</div>
              <div><strong>설명:</strong> {info.campaign_info?.description}</div>
            </div>
          </div>

          {/* 포스트 및 진료 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">📝 포스트 및 진료 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div><strong>포스트 타입:</strong> {info.post_medical_info?.post_type}</div>
              <div><strong>진료과:</strong> {info.post_medical_info?.medical_service_info?.category}</div>
              <div><strong>치료:</strong> {info.post_medical_info?.medical_service_info?.treatment}</div>
              <div><strong>특화 치료:</strong> {info.post_medical_info?.hospital_service_info?.specific_treatments?.join(', ')}</div>
            </div>
          </div>

          {/* 병원 제공 자료 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">📋 병원 제공 자료</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div><strong>증상:</strong> {info.treatment_info?.selected_symptom}</div>
              <div><strong>진단:</strong> {info.treatment_info?.selected_procedure}</div>
              <div><strong>치료:</strong> {info.treatment_info?.selected_treatment}</div>
              <div><strong>치아 번호:</strong> {info.treatment_info?.tooth_numbers?.join(', ')}</div>
              <div><strong>컨셉 메시지:</strong> {info.post_materials?.treatment_info?.concept_message}</div>
              <div><strong>환자 상태:</strong> {info.post_materials?.treatment_info?.patient_condition}</div>
              <div><strong>치료 과정:</strong> {info.post_materials?.treatment_info?.treatment_process_message}</div>
              <div><strong>치료 결과:</strong> {info.post_materials?.treatment_info?.treatment_result_message}</div>
            </div>
          </div>

          {/* 타 포스팅 참고 자료 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">📚 타 포스팅 참고 자료</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div><strong>증상 설명:</strong> {info.clinical_context?.symptom_description}</div>
              <div><strong>진단 설명:</strong> {info.clinical_context?.procedure_description}</div>
              <div><strong>치료 설명:</strong> {info.clinical_context?.treatment_description}</div>
              <div><strong>관련 증상 키워드:</strong> {info.clinical_context?.symptom_keywords?.join(', ')}</div>
              <div><strong>관련 진단 키워드:</strong> {info.clinical_context?.procedure_keywords?.join(', ')}</div>
              <div><strong>관련 치료 키워드:</strong> {info.clinical_context?.treatment_keywords?.join(', ')}</div>
            </div>
          </div>

          {/* 게시 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">📅 게시 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {Array.isArray(info.publish_info) && info.publish_info.length > 0 ? (
                info.publish_info.map((schedule: any, index: number) => (
                  <div key={index} className="border-b border-neutral-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                    <div><strong>예정 일시:</strong> {schedule.scheduled_date}</div>
                    <div><strong>플랫폼:</strong> {schedule.platforms?.channel || '미정'}</div>
                    <div><strong>상태:</strong> {schedule.status}</div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500">게시 정보가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 우측: 입력 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pl-4">
          {/* 페르소나 선택 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">🎭 페르소나 선택</h3>
              <div className="flex items-center space-x-2">
                {!editingPersona ? (
                  <button
                    onClick={() => setEditingPersona(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setPersonaForm(input.persona_selection);
                        setEditingPersona(false);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={savePersona}
                      disabled={saving}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      {saving ? '저장중...' : '저장'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              {!editingPersona ? (
                <div className="space-y-2">
                  <div><strong>페르소나:</strong> {input.persona_selection?.persona_name || '미선택'}</div>
                  <div><strong>설명:</strong> {input.persona_selection?.persona_description || '없음'}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      페르소나 선택
                    </label>
                    <select
                      value={personaForm.persona_name}
                      onChange={(e) => setPersonaForm(prev => ({
                        ...prev,
                        persona_name: e.target.value,
                        persona_description: e.target.options[e.target.selectedIndex].text.includes('통증') ?
                          '임플란트로 저작 시 불편함을 해소하는 점을 강조하는 어투' :
                          '기본 설명'
                      }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="통증/불편 중심형">통증/불편 중심형</option>
                      <option value="심미성 중심형">심미성 중심형</option>
                      <option value="신뢰성 중심형">신뢰성 중심형</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={personaForm.persona_description}
                      onChange={(e) => setPersonaForm(prev => ({ ...prev, persona_description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="페르소나 설명을 입력하세요"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 키워드 가이드 작성 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">🔍 키워드 가이드 작성</h3>
              <div className="flex items-center space-x-2">
                {!editingKeywords ? (
                  <button
                    onClick={() => setEditingKeywords(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setKeywordsForm(input.keywords_guide);
                        setEditingKeywords(false);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={saveKeywordsGuide}
                      disabled={saving}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      {saving ? '저장중...' : '저장'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              {!editingKeywords ? (
                <div className="space-y-3">
                  <div><strong>지역 키워드:</strong> {input.keywords_guide?.region_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>병원 키워드:</strong> {input.keywords_guide?.hospital_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>증상 키워드:</strong> {input.keywords_guide?.symptom_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>진단 키워드:</strong> {input.keywords_guide?.procedure_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>치료 키워드:</strong> {input.keywords_guide?.treatment_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>타겟 키워드:</strong> {input.keywords_guide?.target_keywords_guide?.join(', ') || '없음'}</div>
                  <div><strong>작성 가이드:</strong> {input.keywords_guide?.writing_guide || '없음'}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 키워드 입력 필드들 */}
                  {([
                    { key: 'region_keywords_guide' as KeywordField, label: '지역 키워드', placeholder: '동탄역, 동탄2, 오산동' },
                    { key: 'hospital_keywords_guide' as KeywordField, label: '병원 키워드', placeholder: '보존과 전문의, 임플란트' },
                    { key: 'symptom_keywords_guide' as KeywordField, label: '증상 키워드', placeholder: '잇몸 출혈, 치아 통증' },
                    { key: 'procedure_keywords_guide' as KeywordField, label: '진단 키워드', placeholder: '임플란트 수술, 치아 교정' },
                    { key: 'treatment_keywords_guide' as KeywordField, label: '치료 키워드', placeholder: '디지털 임플란트, 교정 치료' },
                    { key: 'target_keywords_guide' as KeywordField, label: '타겟 키워드', placeholder: '동탄역 임플란트, 동탄 임플란트 잇몸 출혈' }
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        {label}
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {keywordsForm[key].map((keyword: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {keyword}
                            <button
                              onClick={() => removeKeyword(key, keyword)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value) {
                              addKeyword(key, value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      작성 가이드
                    </label>
                    <textarea
                      value={keywordsForm.writing_guide}
                      onChange={(e) => setKeywordsForm(prev => ({ ...prev, writing_guide: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="콘텐츠 작성 시 따라야 할 가이드라인을 입력하세요"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이모지 레벨 선택 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">😊 이모지 레벨 선택</h3>
              <div className="flex items-center space-x-2">
                {!editingEmoji ? (
                  <button
                    onClick={() => setEditingEmoji(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setKeywordsForm(prev => ({ ...prev, emoji_level_value: input.keywords_guide?.emoji_level_value || 2 }));
                        setEditingEmoji(false);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={saveEmojiLevel}
                      disabled={saving}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      {saving ? '저장중...' : '저장'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              {!editingEmoji ? (
                <div>
                  <strong>선택된 레벨:</strong> {input.keywords_guide?.emoji_level_value || 2}단계
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      이모지 사용 강도 선택
                    </label>
                    <div className="flex items-center space-x-4">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            name="emoji_level"
                            value={level}
                            checked={keywordsForm.emoji_level_value === level}
                            onChange={(e) => setKeywordsForm(prev => ({ ...prev, emoji_level_value: parseInt(e.target.value) }))}
                            className="mr-2"
                          />
                          <span className="text-sm">{level}단계</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-neutral-600">
                      {keywordsForm.emoji_level_value === 1 && "이모지를 최소한으로 사용"}
                      {keywordsForm.emoji_level_value === 2 && "기본적인 이모지만 사용"}
                      {keywordsForm.emoji_level_value === 3 && "적절한 수준의 이모지 사용"}
                      {keywordsForm.emoji_level_value === 4 && "활발한 이모지 사용"}
                      {keywordsForm.emoji_level_value === 5 && "매우 적극적인 이모지 사용"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}