class ApplicationController < ActionController::Base
  protect_from_forgery

  def current_user
    @current_user ||= User.find_by_name(cookies[:name]) if cookies[:name]
  end
  helper_method :current_user
end
