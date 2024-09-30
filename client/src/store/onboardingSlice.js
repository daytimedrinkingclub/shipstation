import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  shipType: "",
  currentStep: 0,
  userPrompt: "",
  portfolioType: "",
  sections: [{ id: "1", title: "", content: "", isOpen: true }],
  socialLinks: [],
  imagesForAI: [],
  websiteAssets: [],
  error: null,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setShipType: (state, action) => {
      state.shipType = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    setSocials: (state, action) => {
      state.socialLinks = action.payload;
    },
    setUserPrompt: (state, action) => {
      state.userPrompt = action.payload;
    },
    setPortfolioType: (state, action) => {
      state.portfolioType = action.payload;
    },
    setImagesForAI: (state, action) => {
      state.imagesForAI = action.payload;
    },
    setWebsiteAssets: (state, action) => {
      state.websiteAssets = action.payload;
    },
    removeSection: (state, action) => {
      state.sections = state.sections.filter(
        (section) => section.id !== action.payload
      );
    },
    addSection: (state) => {
      state.sections.push({
        id: Date.now().toString(),
        title: "",
        content: "",
        isOpen: true,
      });
    },
    updateSection: (state, action) => {
      const { id, field, value } = action.payload;
      const section = state.sections.find((section) => section.id === id);
      if (section) {
        section[field] = value;
      }
    },
    updateSectionsOrder: (state, action) => {
      state.sections = action.payload;
    },
    addSocialLink: (state, action) => {
      state.socialLinks.push(action.payload);
    },
    removeSocialLink: (state, action) => {
      state.socialLinks = state.socialLinks.filter(
        (_, index) => index !== action.payload
      );
    },
  },
});

export const {
  setShipType,
  setCurrentStep,
  setUserPrompt,
  setPortfolioType,
  setImagesForAI,
  setWebsiteAssets,
  addSection,
  removeSection,
  setSections,
  updateSection,
  updateSectionsOrder,
  addSocialLink,
  removeSocialLink,
  setSocials,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
