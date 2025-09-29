'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import type { CompletePostingWorkflow } from '@/types/common';

interface GuideProvisionTabProps {
  postId: string;
  hospitalId: number;
  postStatus?: string;
  workflowData: CompletePostingWorkflow | null;
}

interface GuideProvisionData {
  // 좌측 패널: 읽기전용 정보
  guide_provision_info: {
    hospital_info: any;
    campaign_info: any;
    post_medical_info: any;
    treatment_info: any;
    post_materials: any;
    clinical_context: any;
    publish_info: any[] | any;
  } | null;
  // 우측 패널: 편집가능 정보
  guide_input: {
    persona_selection: {
      persona_style_id?: string;
      persona_name: string;
      persona_description: string;
    };
    persona_options: Array<{
      id: string;
      persona_name: string;
      persona_description: string;
      persona_type: string;
      priority: number;
    }>;
    emoji_options: Array<{
      value: number;
      name: string;
      emoji_usage_guide: string;
      description?: string;
    }>;
    keywords_guide: {
      region_keywords: string[];
      hospital_keywords: string[];
      symptom_keywords: string[];
      procedure_keywords: string[];
      treatment_keywords: string[];
      target_keywords: string[];
      writing_guide: string;
      is_completed: boolean;
      emoji_level_value: number;
    };
  } | null;
}

interface KeywordsFormData {
  region_keywords: string[];
  hospital_keywords: string[];
  symptom_keywords: string[];
  procedure_keywords: string[];
  treatment_keywords: string[];
  target_keywords: string[];
  writing_guide: string;
  emoji_level_value: number;
}

type KeywordField = keyof Pick<KeywordsFormData, 'region_keywords' | 'hospital_keywords' | 'symptom_keywords' | 'procedure_keywords' | 'treatment_keywords' | 'target_keywords'>;

export default function GuideProvisionTab({ postId, hospitalId, postStatus, workflowData }: GuideProvisionTabProps) {
  console.log('GuideProvisionTab props:', { postId, hospitalId, postStatus, workflowData });
  const [data, setData] = useState<GuideProvisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPostStatus, setCurrentPostStatus] = useState<string>(postStatus || 'unknown');

  // 포스트 상태 설정 (props에서 가져옴)
  useEffect(() => {
    if (workflowData?.basic_info?.status) {
      setCurrentPostStatus(workflowData.basic_info.status);
    } else {
      setCurrentPostStatus(postStatus || 'unknown');
    }
  }, [workflowData, postStatus]);

  // 편집 모드 상태들
  const [editingPersona, setEditingPersona] = useState(false);
  const [editingKeywords, setEditingKeywords] = useState(false);
  const [editingEmoji, setEditingEmoji] = useState(false);


  // 페르소나 옵션들
  const [personaOptions, setPersonaOptions] = useState<any[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  // 폼 데이터
  const [personaForm, setPersonaForm] = useState({
    persona_style_id: '',
    persona_name: '',
    persona_description: ''
  });
  const [keywordsForm, setKeywordsForm] = useState<KeywordsFormData>({
    region_keywords: [],
    hospital_keywords: [],
    symptom_keywords: [],
    procedure_keywords: [],
    treatment_keywords: [],
    target_keywords: [],
    writing_guide: '',
    emoji_level_value: 2
  });

  console.log('GuideProvisionTab 렌더링 - keywordsForm:', keywordsForm);

  // 키워드 입력 필드 상태
  const [keywordInputs, setKeywordInputs] = useState<Record<KeywordField, string>>({
    region_keywords: '',
    hospital_keywords: '',
    symptom_keywords: '',
    procedure_keywords: '',
    treatment_keywords: '',
    target_keywords: ''
  });

  // keywordsForm 변경 감지 (디버깅용)
  useEffect(() => {
    console.log('keywordsForm 변경됨:', keywordsForm);
  }, [keywordsForm]);


  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!workflowData) return;

      try {
        setLoading(true);

        // 좌측 패널 데이터 (props에서 가져옴)
        const guideProvisionInfo = workflowData.guide_provision_info;

        // 우측 패널 데이터 (편집가능)
        const guideInputResponse = await adminApi.getGuideInput(postId);

        // 데이터를 조합
        const guideData: GuideProvisionData = {
          guide_provision_info: guideProvisionInfo || null,
          guide_input: guideInputResponse
        };

        setData(guideData);

      // 폼 데이터 초기화
      if (guideInputResponse) {
        setPersonaForm({
          persona_style_id: guideInputResponse.persona_selection.persona_style_id || '',
          persona_name: guideInputResponse.persona_selection.persona_name,
          persona_description: guideInputResponse.persona_selection.persona_description
        });
        setPersonaOptions(guideInputResponse.persona_options || []);

        console.log('가이드 입력 데이터 로드:', guideInputResponse);
        console.log('키워드 가이드 데이터:', guideInputResponse.keywords_guide);

        setKeywordsForm({
          region_keywords: guideInputResponse.keywords_guide.region_keywords || [],
          hospital_keywords: guideInputResponse.keywords_guide.hospital_keywords || [],
          symptom_keywords: guideInputResponse.keywords_guide.symptom_keywords || [],
          procedure_keywords: guideInputResponse.keywords_guide.procedure_keywords || [],
          treatment_keywords: guideInputResponse.keywords_guide.treatment_keywords || [],
          target_keywords: guideInputResponse.keywords_guide.target_keywords || [],
          writing_guide: guideInputResponse.keywords_guide.writing_guide || '',
          emoji_level_value: guideInputResponse.keywords_guide.emoji_level_value || 2
        });

        console.log('keywordsForm 설정 후:', keywordsForm);
      }
      } catch (error) {
        console.error('가이드 제공 데이터 로드 실패:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (workflowData) {
      loadData();
    }
  }, [workflowData]);


  // 키워드 저장
  const saveKeywordsGuide = async () => {
    try {
      setSaving(true);

      // 현재 keywordsForm 상태 확인
      console.log('키워드 저장 시작 - 현재 keywordsForm:', keywordsForm);
      console.log('각 키워드 배열 길이:', {
        region_keywords: keywordsForm.region_keywords.length,
        hospital_keywords: keywordsForm.hospital_keywords.length,
        symptom_keywords: keywordsForm.symptom_keywords.length,
        procedure_keywords: keywordsForm.procedure_keywords.length,
        treatment_keywords: keywordsForm.treatment_keywords.length,
        target_keywords: keywordsForm.target_keywords.length
      });

      // 프론트엔드 필드 이름을 백엔드 필드 이름으로 변환
      const transformedData = {
        region_keywords_guide: keywordsForm.region_keywords,
        hospital_keywords_guide: keywordsForm.hospital_keywords,
        symptom_keywords_guide: keywordsForm.symptom_keywords,
        procedure_keywords_guide: keywordsForm.procedure_keywords,
        treatment_keywords_guide: keywordsForm.treatment_keywords,
        target_keywords_guide: keywordsForm.target_keywords,
        writing_guide: keywordsForm.writing_guide,
        emoji_level_value: keywordsForm.emoji_level_value,
        is_completed: false
      };

      console.log('변환된 데이터:', transformedData);

      await adminApi.updateKeywordsGuide(postId, transformedData);
      setEditingKeywords(false);

      // 우측 패널 데이터만 새로고침
      const guideInputResponse = await adminApi.getGuideInput(postId);
      setData(prev => prev ? { ...prev, guide_input: guideInputResponse } : null);
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

      // 우측 패널 데이터만 새로고침
      const guideInputResponse = await adminApi.getGuideInput(postId);
      setData(prev => prev ? { ...prev, guide_input: guideInputResponse } : null);
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

      // 우측 패널 데이터만 새로고침
      const guideInputResponse = await adminApi.getGuideInput(postId);
      setData(prev => prev ? { ...prev, guide_input: guideInputResponse } : null);
    } catch (error) {
      console.error('이모지 레벨 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 키워드 배열 관리 헬퍼 함수들
  const addKeyword = (field: KeywordField, keyword: string) => {
    console.log(`키워드 추가 시도: ${field} = "${keyword}"`);
    if (keyword.trim() && !keywordsForm[field].includes(keyword.trim())) {
      setKeywordsForm(prev => ({
        ...prev,
        [field]: [...prev[field], keyword.trim()]
      }));
      // 입력 필드 초기화
      setKeywordInputs(prev => ({
        ...prev,
        [field]: ''
      }));
      console.log(`키워드 추가됨: ${field}에 "${keyword.trim()}" 추가`);
    } else {
      console.log(`키워드 추가 실패: 이미 존재하거나 빈 문자열 - "${keyword}"`);
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

  // 키워드 가이드가 입력되었는지 확인 (API 데이터 기반)
  const isKeywordsGuideCompleted = () => {
    if (!data?.guide_input?.keywords_guide) return false;

    const keywords = data.guide_input.keywords_guide;
    return (
      (keywords.region_keywords && keywords.region_keywords.length > 0) &&
      (keywords.hospital_keywords && keywords.hospital_keywords.length > 0) &&
      (keywords.symptom_keywords && keywords.symptom_keywords.length > 0) &&
      (keywords.procedure_keywords && keywords.procedure_keywords.length > 0) &&
      (keywords.treatment_keywords && keywords.treatment_keywords.length > 0) &&
      (keywords.target_keywords && keywords.target_keywords.length > 0) &&
      (keywords.writing_guide && keywords.writing_guide.trim() !== '')
    );
  };

  // 가이드 제공 완료하기
  const completeGuideProvision = async () => {
    try {
      setSaving(true);

      // 키워드 가이드 저장 (is_completed: true로)
      const completedKeywordsData = {
        region_keywords_guide: keywordsForm.region_keywords,
        hospital_keywords_guide: keywordsForm.hospital_keywords,
        symptom_keywords_guide: keywordsForm.symptom_keywords,
        procedure_keywords_guide: keywordsForm.procedure_keywords,
        treatment_keywords_guide: keywordsForm.treatment_keywords,
        target_keywords_guide: keywordsForm.target_keywords,
        writing_guide: keywordsForm.writing_guide,
        emoji_level_value: keywordsForm.emoji_level_value,
        is_completed: true  // 완료 상태로 설정
      };

      await adminApi.updateKeywordsGuide(postId, completedKeywordsData);

      // 포스트 상태 업데이트
      await adminApi.updatePostStatus(postId, 'guide_input_completed', '가이드 제공 완료');

      alert('가이드 제공이 완료되었습니다.\nAI 생성 탭으로 이동하여 콘텐츠 생성을 진행해주세요.');

      // 페이지 리로드 없이 상태만 업데이트 (실시간 반영을 위해)
    } catch (error) {
      console.error('가이드 제공 완료 실패:', error);
      alert('가이드 제공 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
  const input = data.guide_input || {
    persona_selection: { persona_name: '', persona_description: '' },
    keywords_guide: {
      region_keywords: [],
      hospital_keywords: [],
      symptom_keywords: [],
      procedure_keywords: [],
      treatment_keywords: [],
      target_keywords: [],
      writing_guide: '',
      is_completed: false,
      emoji_level_value: 2
    }
  };

  return (
    <div className="h-full w-full flex gap-6">
      {/* 좌측: 정보 확인 영역 */}
      <div className="flex-1 bg-neutral-50 rounded-lg border-2 border-neutral-200 overflow-hidden flex flex-col">
        <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-neutral-800 flex items-center">
            <i className="fa-solid fa-eye mr-2 text-neutral-600"></i>
            정보 확인
          </h2>
          <p className="text-xs text-neutral-600 mt-1">포스트 관련 정보를 확인하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
          {/* 병원 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">🏥 병원 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm"><strong>병원명:</strong> {info.hospital_info?.name}</div>
              <div className="text-sm"><strong>주소:</strong> {info.hospital_info?.address}</div>
              <div className="text-sm"><strong>전화:</strong> {info.hospital_info?.phone}</div>
              <div className="text-sm"><strong>웹사이트:</strong> {info.hospital_info?.website}</div>
              <div className="text-sm"><strong>지역:</strong> {info.hospital_info?.region_info?.region_phrase}</div>
              <div className="text-sm"><strong>키워드:</strong> {info.hospital_info?.hospital_keywords?.join(', ')}</div>
            </div>
          </div>

          {/* 캠페인 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">📊 캠페인 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm"><strong>캠페인명:</strong> {info.campaign_info?.name}</div>
              <div className="text-sm"><strong>설명:</strong> {info.campaign_info?.description}</div>
            </div>
          </div>

          {/* 포스트 및 진료 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">📝 포스트 및 진료 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm"><strong>포스트 타입:</strong> {info.post_medical_info?.post_type}</div>
              <div className="text-sm"><strong>진료과:</strong> {info.post_medical_info?.medical_service_info?.category}</div>
              <div className="text-sm"><strong>치료:</strong> {info.post_medical_info?.medical_service_info?.treatment}</div>
              <div className="text-sm"><strong>특화 치료:</strong> {info.post_medical_info?.hospital_service_info?.specific_treatments?.join(', ')}</div>
            </div>
          </div>

          {/* 병원 제공 자료 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">📋 병원 제공 자료</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm"><strong>증상:</strong> {info.treatment_info?.selected_symptom}</div>
              <div className="text-sm"><strong>진단:</strong> {info.treatment_info?.selected_procedure}</div>
              <div className="text-sm"><strong>치료:</strong> {info.treatment_info?.selected_treatment}</div>
              <div className="text-sm"><strong>치아 번호:</strong> {info.treatment_info?.tooth_numbers?.join(', ')}</div>
              <div className="text-sm"><strong>컨셉 메시지:</strong> {info.post_materials?.treatment_info?.concept_message}</div>
              <div className="text-sm"><strong>환자 상태:</strong> {info.post_materials?.treatment_info?.patient_condition}</div>
              <div className="text-sm"><strong>치료 과정:</strong> {info.post_materials?.treatment_info?.treatment_process_message}</div>
              <div className="text-sm"><strong>치료 결과:</strong> {info.post_materials?.treatment_info?.treatment_result_message}</div>
            </div>
          </div>

          {/* 타 포스팅 참고 자료 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">📚 타 포스팅 참고 자료</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm"><strong>증상 설명:</strong> {info.clinical_context?.symptom_description}</div>
              <div className="text-sm"><strong>진단 설명:</strong> {info.clinical_context?.procedure_description}</div>
              <div className="text-sm"><strong>치료 설명:</strong> {info.clinical_context?.treatment_description}</div>
              <div className="text-sm"><strong>관련 증상 키워드:</strong> {info.clinical_context?.symptom_keywords?.join(', ')}</div>
              <div className="text-sm"><strong>관련 진단 키워드:</strong> {info.clinical_context?.procedure_keywords?.join(', ')}</div>
              <div className="text-sm"><strong>관련 치료 키워드:</strong> {info.clinical_context?.treatment_keywords?.join(', ')}</div>
            </div>
          </div>

          {/* 게시 정보 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">📅 게시 정보</h3>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-chevron-up"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {Array.isArray(info.publish_info) && info.publish_info.length > 0 ? (
                info.publish_info.map((schedule: any, index: number) => (
                  <div key={index} className="border-b border-neutral-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="text-sm"><strong>예정 일시:</strong> {schedule.scheduled_date}</div>
                    <div className="text-sm"><strong>플랫폼:</strong> {schedule.platforms?.channel || '미정'}</div>
                    <div className="text-sm"><strong>상태:</strong> {schedule.status}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-neutral-500">게시 정보가 없습니다.</div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* 우측: 입력 영역 */}
      <div className="flex-1 bg-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden flex flex-col">
        <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-blue-800 flex items-center">
            <i className="fa-solid fa-edit mr-2 text-blue-600"></i>
            정보 입력
          </h2>
          <p className="text-xs text-blue-600 mt-1">가이드 제공을 위한 정보를 입력하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
          {/* 페르소나 선택 */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">🎭 페르소나 선택</h3>
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
                        setPersonaForm({
                          persona_style_id: data?.guide_input?.persona_selection?.persona_style_id || '',
                          persona_name: data?.guide_input?.persona_selection?.persona_name || '',
                          persona_description: data?.guide_input?.persona_selection?.persona_description || ''
                        });
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
                  <div className="text-sm"><strong>페르소나:</strong> {input.persona_selection?.persona_name || '미선택'}</div>
                  <div className="text-sm"><strong>설명:</strong> {input.persona_selection?.persona_description || '없음'}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      페르소나 선택
                    </label>
                    <select
                      value={personaForm.persona_style_id}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedPersona = personaOptions.find(p => p.id.toString() === selectedId);
                        setPersonaForm({
                          persona_style_id: selectedId,
                          persona_name: selectedPersona?.persona_name || '',
                          persona_description: selectedPersona?.persona_description || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingPersonas}
                    >
                      <option value="">
                        {loadingPersonas ? '로딩중...' : '선택하세요'}
                      </option>
                      {personaOptions.map((persona) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.persona_name} ({persona.persona_type})
                        </option>
                      ))}
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
              <h3 className="text-sm font-semibold text-neutral-900">🔍 키워드 가이드 작성</h3>
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
                        // 원래 값으로 복원
                        const originalKeywords = data?.guide_input?.keywords_guide;
                        setKeywordsForm({
                          region_keywords: originalKeywords?.region_keywords || [],
                          hospital_keywords: originalKeywords?.hospital_keywords || [],
                          symptom_keywords: originalKeywords?.symptom_keywords || [],
                          procedure_keywords: originalKeywords?.procedure_keywords || [],
                          treatment_keywords: originalKeywords?.treatment_keywords || [],
                          target_keywords: originalKeywords?.target_keywords || [],
                          writing_guide: originalKeywords?.writing_guide || '',
                          emoji_level_value: originalKeywords?.emoji_level_value || 2
                        });
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
                  <div className="text-sm"><strong>지역 키워드:</strong> {input.keywords_guide?.region_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>병원 키워드:</strong> {input.keywords_guide?.hospital_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>증상 키워드:</strong> {input.keywords_guide?.symptom_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>진단 키워드:</strong> {input.keywords_guide?.procedure_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>치료 키워드:</strong> {input.keywords_guide?.treatment_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>타겟 키워드:</strong> {input.keywords_guide?.target_keywords?.join(', ') || '없음'}</div>
                  <div className="text-sm"><strong>작성 가이드:</strong> {input.keywords_guide?.writing_guide || '없음'}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 키워드 입력 필드들 */}
                  {([
                    { key: 'region_keywords' as KeywordField, label: '지역 키워드', placeholder: '빌딩명, 근처 건물명, 역명' },
                    { key: 'hospital_keywords' as KeywordField, label: '병원 키워드', placeholder: '병원특징키워드' },
                    { key: 'symptom_keywords' as KeywordField, label: '증상 키워드', placeholder: '증상특징키워드' },
                    { key: 'procedure_keywords' as KeywordField, label: '진단 키워드', placeholder: '진단특징키워드' },
                    { key: 'treatment_keywords' as KeywordField, label: '치료 키워드', placeholder: '치료특징키워드' },
                    { key: 'target_keywords' as KeywordField, label: '타겟 키워드', placeholder: '타겟특징키워드' }
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
                        value={keywordInputs[key]}
                        onChange={(e) => {
                          setKeywordInputs(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = keywordInputs[key].trim();
                            console.log(`키워드 입력 시도: ${key} = "${value}" (from state)`);
                            if (value) {
                              addKeyword(key, value);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && !keywordsForm[key].includes(value)) {
                            console.log(`키워드 blur 추가: ${key} = "${value}"`);
                            addKeyword(key, value);
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
              <h3 className="text-sm font-semibold text-neutral-900">😊 이모지 레벨 선택</h3>
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
                        setKeywordsForm(prev => ({ ...prev, emoji_level_value: data?.guide_input?.keywords_guide?.emoji_level_value || 2 }));
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
                  {input.keywords_guide?.emoji_level_value ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>선택된 레벨:</strong> {(() => {
                          const selectedLevel = data?.guide_input?.emoji_options?.find(
                            option => option.value === input.keywords_guide.emoji_level_value
                          );
                          return selectedLevel ? `${selectedLevel.name} (레벨 ${selectedLevel.value})` : `${input.keywords_guide.emoji_level_value}단계`;
                        })()}
                      </div>
                      {(() => {
                        const selectedLevel = data?.guide_input?.emoji_options?.find(
                          option => option.value === input.keywords_guide.emoji_level_value
                        );
                        return selectedLevel ? (
                          <div className="text-sm text-neutral-600 mt-2 p-3 bg-neutral-50 rounded">
                            <strong>사용 가이드:</strong> {selectedLevel.emoji_usage_guide}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500">선택해주세요</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      이모지 레벨 선택
                    </label>
                    <select
                      value={keywordsForm.emoji_level_value || ''}
                      onChange={(e) => setKeywordsForm(prev => ({ ...prev, emoji_level_value: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택하세요</option>
                      {data?.guide_input?.emoji_options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name} (레벨 {option.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      사용 가이드
                    </label>
                    <div className="text-sm text-neutral-600 p-3 bg-neutral-50 rounded">
                      {(() => {
                        const selectedOption = data?.guide_input?.emoji_options?.find(
                          option => option.value === keywordsForm.emoji_level_value
                        );
                        return selectedOption ? selectedOption.emoji_usage_guide : '이모지 레벨을 선택해주세요';
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 가이드 제공 완료하기 버튼 */}
          {currentPostStatus !== 'guide_input_completed' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-green-800">가이드 제공 완료</h4>
                  <p className="text-xs text-green-600 mt-1">
                    키워드 가이드를 입력한 후 완료 버튼을 클릭하세요
                  </p>
                </div>
                <button
                  onClick={completeGuideProvision}
                  disabled={saving || !isKeywordsGuideCompleted()}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    saving || !isKeywordsGuideCompleted()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? '처리중...' : '가이드 제공 완료하기'}
                </button>
              </div>
              {!isKeywordsGuideCompleted() && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ 키워드 가이드가 입력되지 않았습니다. 최소 하나의 키워드나 작성 가이드를 입력해주세요.
                </p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}